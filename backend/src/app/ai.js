// PURPOSE OF AI:
// return cafe recommendations based on user preferences (filter UX), using the
// Deepseek API to match the user's needs with the cafe attributes.
//
// Split of work:
//   - Distance filter        -> code (deterministic, reliable)
//   - Top 3 best matches      -> AI (budget / purpose / notes matching)
//   - The rest, by rating     -> code (exact data, sorted high -> low)

import OpenAI from "openai";
import "dotenv/config";
import express from "express";
import { searchNearbyCafes } from "./lib/places.js";

const router = express.Router();

const TOP_N = 3; // how many cafes the AI features as "best matches"

function getClient() {
  if (!process.env.DEEPSEEK_API_KEY) {
    return null;
  }

  return new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY,
  });
}

// --- Straight-line (Haversine) distance between two {lat, lng} points, in km ---
function distanceKm(a, b) {
  const R = 6371; // Earth radius in km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// --- Filter by distance (deterministic) + slim the payload before the model ---
function prepareCafes(cafes, preferences) {
  const user = preferences?.location; // { lat, lng } | undefined
  const maxKm = preferences?.distance; // number (km) | undefined

  let list = cafes;

  if (user && typeof user.lat === "number" && typeof user.lng === "number") {
    list = cafes.map((c) => {
      const d = distanceKm(user, {
        lat: c.location.latitude,
        lng: c.location.longitude,
      });
      return { ...c, _distanceKm: Math.round(d * 10) / 10 };
    });

    if (typeof maxKm === "number") {
      list = list.filter((c) => c._distanceKm <= maxKm); // distance filter
    }

    list.sort((a, b) => a._distanceKm - b._distanceKm);
  }

  // Slim each cafe: drop `photos`, keep only what's useful. `id` is kept so we
  // can match the AI's picks back to the full data exactly.
  return list.map((c) => ({
    id: c.id,
    name: c.displayName?.text ?? c.name,
    address: c.formattedAddress,
    latitude: c.location?.latitude,
    longitude: c.location?.longitude,
    rating: c.rating,
    userRatingCount: c.userRatingCount,
    priceLevel: c.priceLevel,
    types: c.types,
    outdoorSeating: c.outdoorSeating,
    allowsDogs: c.allowsDogs,
    goodForGroups: c.goodForGroups,
    summary: c.editorialSummary?.text,
    distanceKm: c._distanceKm, // undefined if no location provided
  }));
}

// --- Ask the AI for the top N best matches only ---
async function pickTopMatches(cafes, preferences) {
  const client = getClient();
  if (!client) {
    return null;
  }

  const prompt = `
You are a cafe recommendation assistant.

Here are the available cafes (already within the user's distance range, nearest first):
${JSON.stringify(cafes, null, 2)}

Here are the user's preferences:
${JSON.stringify(preferences, null, 2)}

Pick the ${TOP_N} cafes that best match the user's budget, purpose, and notes.
Return ONLY those ${TOP_N} (or fewer if there aren't that many) as a JSON array
(no markdown, no extra text) with this exact structure:
[
  {
    "id": "<copy the cafe's id exactly>",
    "matchScore": <number from 1 to 5>,
    "summary": "<1-2 sentence explanation of why this cafe suits the user>"
  }
]

Rank them by match score, highest first. Be specific in each summary.
`;

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1024,
  });

  const raw = response.choices[0].message.content.trim();
  const clean = raw.replace(/^```json\n?|```$/g, "").trim();
  return JSON.parse(clean); // [{ id, matchScore, summary }]
}

function fallbackTopMatches(cafes) {
  return cafes
    .slice()
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, TOP_N)
    .map((cafe) => ({
      id: cafe.id,
      matchScore: Math.min(5, Math.max(1, Math.round(cafe.rating ?? 3))),
      summary: "Recommended based on nearby cafe data and rating.",
    }));
}

function appendMessage(current, next) {
  return [current, next].filter(Boolean).join(" ");
}

router.post("/recommend", async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences?.location) {
      return res.status(400).json({
        error: "Request body must include 'preferences' with a 'location' ({ lat, lng }).",
      });
    }

    const { lat, lng } = preferences.location;
    const radiusMeters = Math.min(Math.max(preferences.distance ?? 5, 1), 50) * 1000;

    // 1) Live lookup from Google Places, restricted to the requested radius
    let places = await searchNearbyCafes({ lat, lng, radiusMeters });
    let message;
    let prepPreferences = preferences;

    if (places.length === 0) {
      // Nothing in range — widen the search just to build a ranked fallback list.
      // Drop `distance` so prepareCafes's maxKm filter doesn't re-exclude these.
      places = await searchNearbyCafes({ lat, lng, radiusMeters: 50000 });
      message = `No cafes found within ${preferences.distance} km. Showing the best matches instead.`;
      prepPreferences = { ...preferences, distance: undefined };
    }

    // 2) Deterministic distance filter/sort + slim payload
    const prepared = prepareCafes(places, prepPreferences);

    if (prepared.length === 0) {
      return res.json({ recommended: [], others: [], message: "No cafes found nearby." });
    }

    // 3) AI picks the top matches. If AI is unavailable, keep the page usable.
    let picks = await pickTopMatches(prepared, preferences); // [{id, matchScore, summary}]
    if (!picks) {
      picks = fallbackTopMatches(prepared);
      message = appendMessage(
        message,
        "AI matching is unavailable, so these are ranked by cafe rating.",
      );
    }

    // 4) Merge AI picks back onto the full cafe data, by id
    const pickedIds = new Set(picks.map((p) => p.id));
    const recommended = picks
      .map((p) => {
        const cafe = prepared.find((c) => c.id === p.id);
        if (!cafe) return null; // AI returned an id we don't have; drop it
        return { ...cafe, matchScore: p.matchScore, summary: p.summary };
      })
      .filter(Boolean)
      .sort((a, b) => b.matchScore - a.matchScore); // best match first

    // 5) Everything else, sorted by rating high -> low (code, not AI)
    const others = prepared
      .filter((c) => !pickedIds.has(c.id))
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    res.json({ recommended, others, message });
  } catch (err) {
    console.error("Error generating recommendations:", err);
    res.status(err.statusCode ?? 500).json({
      error: err.message || "Failed to generate recommendations.",
    });
  }
});

export default router;

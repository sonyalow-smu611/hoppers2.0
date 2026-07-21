import express from "express";
import supabase from "../../lib/supabase.js";
import { getAuth } from "@clerk/express";
import { getPlacePhotoUrl } from "../../lib/cafeSync.js";

const router = express.Router();
const SAVED_LIST_TITLE = "Saved Cafes";

function toFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toPriceRange(priceLevel) {
  const priceRanges = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };

  if (typeof priceLevel === "number") {
    return Math.min(Math.max(Math.round(priceLevel), 0), 4);
  }

  return priceRanges[priceLevel] ?? null;
}

function getCafeName(cafe) {
  return cafe?.name?.trim() ?? cafe?.displayName?.text?.trim() ?? "";
}

function getCafePlaceId({ cafe_id, cafe }) {
  const numericCafeId = toFiniteNumber(cafe_id);

  if (numericCafeId !== null) {
    return null;
  }

  return String(cafe?.place_id ?? cafe?.id ?? cafe_id ?? "").trim() || null;
}

async function findExistingCafe(cafe, placeId) {
  if (placeId) {
    const { data, error } = await supabase
      .from("cafes")
      .select("id")
      .eq("place_id", placeId)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (data?.id) return data.id;
  }

  const name = getCafeName(cafe);
  const address = (cafe?.address ?? cafe?.formattedAddress)?.trim();

  if (!name) return null;

  let query = supabase.from("cafes").select("id").eq("name", name).limit(1);
  if (address) {
    query = query.eq("address", address);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;

  return data?.id ?? null;
}

async function resolveCafeId({ cafe_id, cafe }) {
  const numericCafeId = toFiniteNumber(cafe_id);
  if (numericCafeId !== null) {
    return numericCafeId;
  }

  const placeId = getCafePlaceId({ cafe_id, cafe });
  const name = getCafeName(cafe);
  if (!name) {
    const error = new Error("cafe_id must be numeric, or cafe.name is required");
    error.statusCode = 400;
    throw error;
  }

  const existingId = await findExistingCafe(cafe, placeId);
  if (existingId !== null) {
    return existingId;
  }

  const latitude = toFiniteNumber(cafe.latitude ?? cafe.location?.latitude);
  const longitude = toFiniteNumber(cafe.longitude ?? cafe.location?.longitude);
  const address = (cafe.address ?? cafe.formattedAddress)?.trim() ?? "";
  const tags = cafe.types ?? cafe.tags;

  const { data, error } = await supabase
    .from("cafes")
    .insert({
      place_id: placeId,
      name,
      address,
      description: cafe.summary ?? cafe.editorialSummary?.text ?? "",
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      picture: cafe.picture ?? getPlacePhotoUrl(cafe) ?? "",
      price_range: toPriceRange(cafe.priceLevel),
      tags: Array.isArray(tags) ? tags.join(", ") : "",
    })
    .select("id")
    .single();

  if (error) throw error;

  return data.id;
}

router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("list")
    .select("list_id, title, notes, list_type, user_id, visit_type, cafes(*)");

  if (error) return res.status(500).json({ error: error.message });

  const boards = Object.values(
    data.reduce((acc, row) => {
      const key = `${row.user_id}-${row.title}`;
      acc[key] ??= {
        title: row.title,
        notes: row.notes,
        list_type: row.list_type,
        user_id: row.user_id,
        cafes: [],
      };
      acc[key].cafes.push({
        ...row.cafes,
        list_id: row.list_id,
        visit_type: row.visit_type,
      });
      return acc;
    }, {}),
  );

  res.json({ lists: boards });
});

router.patch("/board/privacy", async (req, res) => {
  const { user_id, title, list_type } = req.body;

  const { error } = await supabase
    .from("list")
    .update({ list_type })
    .eq("user_id", user_id)
    .eq("title", title);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ user_id, title, list_type });
});

router.get("/saved-list", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { data, error } = await supabase
    .from("list")
    .select("list_id, title, notes, user_id, cafe_id, cafes(*)")
    .eq("user_id", userId)
    .eq("title", SAVED_LIST_TITLE);

  if (error) {
    console.error("Supabase get saved places error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ savedPlaces: data });
});

router.post("/saved-list", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { cafe_id, cafe } = req.body;

  if (!cafe_id) {
    return res.status(400).json({ error: "cafe_id is required" });
  }

  const numericCafeId = toFiniteNumber(cafe_id);
  let resolvedCafeId;
  try {
    resolvedCafeId = await resolveCafeId({ cafe_id, cafe });
  } catch (error) {
    console.error("Supabase resolve cafe error:", error);
    return res
      .status(error.statusCode ?? 500)
      .json({ error: error.message ?? "Failed to save cafe." });
  }

  const { data: existing, error: existingError } = await supabase
    .from("list")
    .select("list_id, title, notes, user_id, cafe_id, cafes(*)")
    .eq("user_id", userId)
    .eq("title", SAVED_LIST_TITLE)
    .eq("cafe_id", resolvedCafeId)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    console.error("Supabase saved place lookup error:", existingError);
    return res.status(500).json({ error: existingError.message });
  }

  if (existing) {
    if (numericCafeId === null && !existing.notes) {
      const externalCafeId = String(cafe_id);
      const { data: updated, error: updateError } = await supabase
        .from("list")
        .update({ notes: externalCafeId })
        .eq("list_id", existing.list_id)
        .select("list_id, title, notes, user_id, cafe_id, cafes(*)")
        .single();

      if (updateError) {
        console.error("Supabase saved place note backfill error:", updateError);
        return res.status(500).json({ error: updateError.message });
      }

      return res.status(200).json(updated);
    }

    return res.status(200).json(existing);
  }

  const externalCafeId = numericCafeId === null ? String(cafe_id) : "";

  const { data, error } = await supabase
    .from("list")
    .insert({
      title: SAVED_LIST_TITLE,
      notes: externalCafeId,
      list_type: false,
      visit_type: false,
      cafe_id: resolvedCafeId,
      user_id: userId, // comes from the verified Clerk token, not the request body
    })
    .select("list_id, title, notes, user_id, cafe_id, cafes(*)")
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

router.delete("/saved-list/:cafe_id", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { cafe_id } = req.params;
  const numericCafeId = toFiniteNumber(cafe_id);

  let query = supabase
    .from("list")
    .delete()
    .eq("user_id", userId)
    .eq("title", SAVED_LIST_TITLE);

  query =
    numericCafeId === null
      ? query.eq("notes", cafe_id)
      : query.eq("cafe_id", numericCafeId);

  const { data, error } = await query.select("list_id, cafe_id");

  if (error) {
    console.error("Supabase delete saved place error:", error);
    return res.status(500).json({ error: error.message });
  }

  if (data.length === 0) {
    return res.status(404).json({ error: "Saved place not found" });
  }

  res.json({ deleted: data });
});

router.patch("/:id", async (req, res) => {
  const { visit_type } = req.body;
  const listId = Number(req.params.id);

  const { error } = await supabase
    .from("list")
    .update({ visit_type })
    .eq("list_id", listId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ list_id: listId, visit_type });
});

router.delete("/:id", async (req, res) => {
  const { error } = await supabase
    .from("list")
    .delete()
    .eq("list_id", Number(req.params.id));

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

export default router;

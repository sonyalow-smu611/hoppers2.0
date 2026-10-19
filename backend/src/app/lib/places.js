const FIELD_MASK = [
  "places.id", "places.displayName", "places.formattedAddress",
  "places.location", "places.priceLevel", "places.rating",
  "places.userRatingCount", "places.types", "places.outdoorSeating",
  "places.allowsDogs", "places.goodForGroups", "places.editorialSummary",
  "places.photos",
].join(",");

export async function searchNearbyCafes({ lat, lng, radiusMeters }) {
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    const error = new Error("GOOGLE_PLACES_API_KEY is required to search nearby cafes.");
    error.statusCode = 503;
    throw error;
  }

  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      includedTypes: ["cafe"],
      maxResultCount: 20,
      locationRestriction: {
        circle: { center: { latitude: lat, longitude: lng }, radius: radiusMeters },
      },
    }),
  });
  if (!res.ok) throw new Error(`Places API error: ${res.status} ${await res.text()}`);
  const { places } = await res.json();
  return places ?? [];
}

// look up a single place by name (used to backfill photos for seed cafes)
export async function searchPlaceByName(query) {
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    throw new Error("GOOGLE_PLACES_API_KEY is required to search places by name.");
  }
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.photos",
    },
    body: JSON.stringify({ textQuery: `${query} Singapore`, languageCode: "en" }),
  });
  if (!res.ok) {
    throw new Error(`Places Text Search error: ${res.status} ${await res.text()}`);
  }
  const { places } = await res.json();
  return places?.[0] ?? null;
}

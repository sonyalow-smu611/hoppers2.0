const FIELD_MASK = [
  "places.id", "places.displayName", "places.formattedAddress",
  "places.location", "places.priceLevel", "places.rating",
  "places.userRatingCount", "places.types", "places.outdoorSeating",
  "places.allowsDogs", "places.goodForGroups", "places.editorialSummary",
].join(",");

export async function searchNearbyCafes({ lat, lng, radiusMeters }) {
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

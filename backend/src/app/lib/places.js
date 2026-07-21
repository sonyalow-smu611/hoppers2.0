const FIELD_MASK = [
  "places.id", "places.displayName", "places.location",
  "places.formattedAddress", "places.types", "places.editorialSummary",
  "places.priceLevel", "places.photos", "places.rating",
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

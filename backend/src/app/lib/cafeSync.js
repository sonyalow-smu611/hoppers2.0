import { supabaseServiceRole } from './supabase.js'

const PRICE_LEVELS = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
}

export function toPriceRange(priceLevel) {
  return PRICE_LEVELS[priceLevel] ?? null
}

export function getPlacePhotoUrl(place) {
  const photoName = place?.photos?.[0]?.name

  if (!photoName || !process.env.GOOGLE_PLACES_API_KEY) {
    return null
  }

  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${process.env.GOOGLE_PLACES_API_KEY}`
}

export function mapPlaceToCafeRow(place) {
  const name = place?.displayName?.text?.trim()
  const latitude = place?.location?.latitude
  const longitude = place?.location?.longitude

  if (!place?.id || !name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null
  }

  return {
    place_id: place.id,
    name,
    longitude,
    latitude,
    tags: Array.isArray(place.types) ? place.types.join(', ') : '',
    description: place.editorialSummary?.text ?? null,
    picture: getPlacePhotoUrl(place),
    price_range: toPriceRange(place.priceLevel),
    address: place.formattedAddress ?? '',
  }
}

export async function upsertPlacesAsCafes(places) {
  if (!Array.isArray(places) || places.length === 0) {
    return
  }

  if (!supabaseServiceRole) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required to sync cafes.')
  }

  const rows = places.map(mapPlaceToCafeRow).filter(Boolean)

  if (rows.length === 0) {
    return
  }

  const { error } = await supabaseServiceRole
    .from('cafes')
    .upsert(rows, { onConflict: 'place_id' })

  if (error) {
    throw error
  }
}


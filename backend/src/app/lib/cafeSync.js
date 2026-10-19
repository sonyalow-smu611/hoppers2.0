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

function normalizeCafeValue(value) {
  return String(value ?? '').trim().toLowerCase()
}

function escapeIlikeValue(value) {
  return value.replace(/[\\%_]/g, '\\$&')
}

async function upsertPlaceRow(row) {
  const { error } = await supabaseServiceRole
    .from('cafes')
    .upsert(row, { onConflict: 'place_id' })

  if (!error) return
  if (error.code !== '23505' || !error.message?.includes('cafes_seed_unique')) {
    throw error
  }

  const { data: candidates, error: lookupError } = await supabaseServiceRole
    .from('cafes')
    .select('id, name, address')
    .ilike('name', escapeIlikeValue(row.name))

  if (lookupError) throw lookupError

  const matchingCafe = (candidates ?? []).find(
    (cafe) =>
      normalizeCafeValue(cafe.name) === normalizeCafeValue(row.name) &&
      normalizeCafeValue(cafe.address) === normalizeCafeValue(row.address),
  )

  if (!matchingCafe) throw error

  const { error: updateError } = await supabaseServiceRole
    .from('cafes')
    .update(row)
    .eq('id', matchingCafe.id)

  if (updateError) throw updateError
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

  try {
    const { error } = await supabaseServiceRole
      .from('cafes')
      .upsert(rows, { onConflict: 'place_id' })

    if (!error) return
    if (error.code !== '23505' || !error.message?.includes('cafes_seed_unique')) {
      throw error
    }
  } catch (error) {
    if (error.code !== '23505' || !error.message?.includes('cafes_seed_unique')) {
      throw error
    }
  }

  await Promise.all(rows.map(upsertPlaceRow))
}

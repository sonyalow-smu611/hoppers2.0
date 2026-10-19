import express from 'express'
import supabase, { supabaseServiceRole } from '../../lib/supabase.js'
import { searchNearbyCafes, searchPlaceByName } from '../../lib/places.js'
import { upsertPlacesAsCafes } from '../../lib/cafeSync.js'

const router = express.Router()

function toFiniteNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function syncPlacesInBackground(places) {
  upsertPlacesAsCafes(places).catch((error) => {
    console.error('Supabase cafe sync error:', error)
  })
}

function placePhotoUrl(place) {
  const photoName = place?.photos?.[0]?.name
  if (!photoName || !process.env.GOOGLE_PLACES_API_KEY) return null
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${process.env.GOOGLE_PLACES_API_KEY}`
}

router.get('/photo', async (req, res) => {
  try {
    const photoName = String(req.query.name ?? '')

    if (!photoName.startsWith('places/') || !photoName.includes('/photos/')) {
      return res.status(400).json({ error: 'A valid Google Places photo name is required.' })
    }

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return res.status(503).json({ error: 'GOOGLE_PLACES_API_KEY is required to load cafe photos.' })
    }

    const photoUrl = new URL(`https://places.googleapis.com/v1/${photoName}/media`)
    photoUrl.searchParams.set('maxWidthPx', '400')
    photoUrl.searchParams.set('maxHeightPx', '400')
    photoUrl.searchParams.set('skipHttpRedirect', 'true')
    photoUrl.searchParams.set('key', process.env.GOOGLE_PLACES_API_KEY)

    const photoResponse = await fetch(photoUrl)

    if (!photoResponse.ok) {
      return res.status(photoResponse.status).json({
        error: `Places photo API error: ${await photoResponse.text()}`,
      })
    }

    const { photoUri } = await photoResponse.json()

    if (!photoUri) {
      return res.status(502).json({ error: 'Places photo API did not return a photo URL.' })
    }

    res.redirect(photoUri)
  } catch (err) {
    console.error('Google Places photo error:', err)
    res.status(500).json({ error: err.message || 'Failed to load cafe photo.' })
  }
})

// list cafes for the dropdown picker (and any other lightweight consumer)
//   ?compact=true  -> only id, name, address (smaller payload)
//   ?limit=N       -> cap rows returned, max 1000
// rows are sorted by name ascending so the UI is deterministic.
// Default (no params) returns ALL cafes in name-asc order — keeps
// backward-compat with callers that expect an unpaginated list.
router.get('/', async (req, res) => {
  const compact = String(req.query.compact ?? '').toLowerCase() === 'true'
  const requestedLimit = Number(req.query.limit)
  const hasExplicitLimit = Number.isInteger(requestedLimit) && requestedLimit > 0
  const limit = hasExplicitLimit ? Math.min(requestedLimit, 1000) : null

  let query = supabase
    .from('cafes')
    .select(compact ? 'id, name, address' : '*')
    .order('name', { ascending: true })
  if (limit !== null) query = query.limit(limit)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json({ cafes: data })
})

router.post('/sync', async (req, res) => {
  try {
    const latitude = toFiniteNumber(req.body.latitude)
    const longitude = toFiniteNumber(req.body.longitude)
    const radiusMeters = toFiniteNumber(req.body.radiusMeters) ?? 1200

    if (latitude === null || longitude === null) {
      return res.status(400).json({ error: 'latitude and longitude are required numbers' })
    }

    if (radiusMeters <= 0) {
      return res.status(400).json({ error: 'radiusMeters must be greater than 0' })
    }

    const places = await searchNearbyCafes({
      lat: latitude,
      lng: longitude,
      radiusMeters,
    })

    res.json({ cafes: places })
    syncPlacesInBackground(places)
  } catch (err) {
    console.error('Google Places cafe sync error:', err)
    res.status(err.statusCode ?? 500).json({
      error: err.message || 'Failed to sync cafes.',
    })
  }
})

// backfill: resolve real Google Places photos for cafes that are missing one
router.post('/backfill-photos', async (req, res) => {
  if (!supabaseServiceRole) {
    return res.status(503).json({ error: 'SUPABASE_SERVICE_ROLE_KEY is required' })
  }
  const { data: cafes, error } = await supabaseServiceRole
    .from('cafes')
    .select('id, name, picture')
  if (error) return res.status(500).json({ error: error.message })

  const missing = (cafes || []).filter((c) => !c.picture || !c.picture.trim())
  let updated = 0
  let skipped = 0
  const failed = []

  for (const cafe of missing) {
    try {
      const place = await searchPlaceByName(cafe.name)
      const photoUrl = placePhotoUrl(place)
      if (!photoUrl) {
        skipped++
        continue
      }
      // only update picture (these seed rows may duplicate a synced cafe's place_id,
      // which has a unique constraint — so we don't touch place_id here)
      const patch = { picture: photoUrl }
      const { error: upErr } = await supabaseServiceRole
        .from('cafes')
        .update(patch)
        .eq('id', cafe.id)
      if (upErr) {
        failed.push(`${cafe.name}: ${upErr.message}`)
        continue
      }
      updated++
      // be gentle with the Places API
      await new Promise((r) => setTimeout(r, 120))
    } catch (e) {
      failed.push(`${cafe.name}: ${e.message}`)
    }
  }

  res.json({ checked: missing.length, updated, skipped, failed })
})

// look up a single cafe by name (used by the map sidebar's "read reviews")
router.get('/by-name', async (req, res) => {
  const name = req.query.name
  if (!name) return res.status(400).json({ error: 'name query is required' })
  const { data, error } = await supabase
    .from('cafes')
    .select('id, name')
    .ilike('name', name)
    .limit(1)
  if (error) return res.status(500).json({ error: error.message })
  if (!data || data.length === 0) return res.status(404).json({ error: 'Cafe not found' })
  res.json({ cafe: data[0] })
})

// get a single cafe by id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('cafes')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle()
  if (error) return res.status(500).json({ error: error.message })
  if (!data) return res.status(404).json({ error: 'Cafe not found' })
  res.json({ cafe: data })
})

export default router

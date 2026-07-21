import express from 'express'
import supabase from '../../lib/supabase.js'
import { searchNearbyCafes } from '../../lib/places.js'
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

// get all cafes
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('cafes')
    .select('*')

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

export default router

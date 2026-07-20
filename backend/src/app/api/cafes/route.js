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

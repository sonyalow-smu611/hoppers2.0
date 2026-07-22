import express from 'express'
import supabase from '../../lib/supabase.js'

const router = express.Router()

// get posts, optionally filtered by ?cafe_id=, joined with cafe name/picture, newest first
router.get('/', async (req, res) => {
  const { cafe_id } = req.query
  let query = supabase
    .from('posts')
    .select('*, cafe:cafes(name, picture)')
  if (cafe_id) query = query.eq('cafe_id', cafe_id)
  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) {
    console.error('[posts] fetch failed:', error)
    return res.status(500).json({ error: error.message })
  }
  res.json({ posts: data })
})

router.post('/', async (req, res) => {
  const {
    cafe_name, rating, description, visited_at,
    photos, author_name, author_avatar,
  } = req.body || {}

  if (!cafe_name || !rating || !description) {
    return res.status(400).json({ error: 'Cafe name, rating and description are required' })
  }

  // resolve cafe_name -> cafe_id
  const { data: cafe, error: cafeError } = await supabase
    .from('cafes')
    .select('id')
    .ilike('name', cafe_name)
    .maybeSingle()

  if (cafeError) {
    console.error('[posts] cafe lookup failed:', cafeError)
    return res.status(500).json({ error: cafeError.message })
  }
  if (!cafe) return res.status(404).json({ error: `Cafe "${cafe_name}" not found` })

  // normalise photos to a JSON array string (supports multi-photo)
  let photosValue = null
  if (Array.isArray(photos)) {
    photosValue = photos.length ? JSON.stringify(photos) : null
  } else if (typeof photos === 'string' && photos.trim()) {
    photosValue = JSON.stringify([photos])
  }

  // NOTE: posts.user_id has no FK and there is no `users` table yet, so we use a
  // placeholder author. Swap for a real Clerk->users lookup once that table exists.
  const PLACEHOLDER_USER_ID = 1
  const base = {
    cafe_id: cafe.id,
    rating: Number(rating),
    text_review: description,
    visited_at: visited_at || new Date().toISOString(),
    photos: photosValue,
    user_id: PLACEHOLDER_USER_ID,
  }

  // try with denormalized author columns; fall back if they don't exist yet
  const run = (payload) => supabase.from('posts').insert(payload).select().single()
  let result = await run({ ...base, author_name: author_name || null, author_avatar: author_avatar || null })
  if (result.error && /author_(name|avatar)/i.test(result.error.message)) {
    result = await run(base)
  }
  const { data, error } = result

  if (error) {
    console.error('[posts] insert failed:', error)
    return res.status(500).json({ error: error.message })
  }
  res.status(201).json({ post: data })
})

export default router

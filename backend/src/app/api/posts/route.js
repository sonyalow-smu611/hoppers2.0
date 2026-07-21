import express from 'express'
import supabase from '../../lib/supabase.js'
import { getAuth } from '@clerk/express'

const router = express.Router()

const POST_COLUMNS =
  'id, user_id, cafe_id, rating, text_review, visited_at, photos, comments, created_at'

function normalizePost(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    cafe_id: row.cafe_id,
    rating: row.rating,
    text_review: row.text_review,
    visited_at: row.visited_at,
    photos: row.photos,
    comments: row.comments,
    created_at: row.created_at,
    cafes: row.cafes ?? null,
  }
}

function isMissingRelationshipError(error) {
  return error?.code === 'PGRST200' || error?.message?.includes('relationship')
}

async function selectPosts() {
  const withCafe = await supabase
    .from('posts')
    .select(`${POST_COLUMNS}, cafes(*)`)
    .order('created_at', { ascending: false })

  if (!withCafe.error || !isMissingRelationshipError(withCafe.error)) {
    return withCafe
  }

  return supabase
    .from('posts')
    .select(POST_COLUMNS)
    .order('created_at', { ascending: false })
}

async function selectCafes() {
  return supabase.from('cafes').select('*')
}

async function selectPostById(id) {
  const withCafe = await supabase
    .from('posts')
    .select(`${POST_COLUMNS}, cafes(*)`)
    .eq('id', id)
    .single()

  if (!withCafe.error || !isMissingRelationshipError(withCafe.error)) {
    return withCafe
  }

  return supabase.from('posts').select(POST_COLUMNS).eq('id', id).single()
}

function validatePostBody(body) {
  const cafeId = Number(body.cafe_id)
  const rating = Number(body.rating)
  const textReview =
    typeof body.text_review === 'string' ? body.text_review.trim() : ''

  if (!Number.isInteger(cafeId) || cafeId <= 0) {
    return { error: 'cafe_id must be a valid number' }
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: 'rating must be an integer from 1 to 5' }
  }

  if (!textReview) {
    return { error: 'text_review is required' }
  }

  const visitedAt = body.visited_at ? new Date(body.visited_at) : new Date()

  if (Number.isNaN(visitedAt.getTime())) {
    return { error: 'visited_at must be a valid date' }
  }

  const photos =
    typeof body.photos === 'string' && body.photos.trim()
      ? body.photos.trim()
      : null
  const comments =
    typeof body.comments === 'string' && body.comments.trim()
      ? body.comments.trim()
      : null

  return {
    value: {
      cafe_id: cafeId,
      rating,
      text_review: textReview,
      visited_at: visitedAt.toISOString(),
      photos,
      comments,
    },
  }
}

// get all posts
router.get('/', async (req, res) => {
  const [postsResult, cafesResult] = await Promise.all([
    selectPosts(),
    selectCafes(),
  ])

  if (postsResult.error) {
    return res.status(500).json({ error: postsResult.error.message })
  }

  if (cafesResult.error) {
    return res.status(500).json({ error: cafesResult.error.message })
  }

  res.json({
    posts: postsResult.data.map(normalizePost),
    cafes: cafesResult.data,
  })
})

router.post('/', async (req, res) => {
  const { userId } = getAuth(req)

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const validation = validatePostBody(req.body)

  if (validation.error) {
    return res.status(400).json({ error: validation.error })
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...validation.value,
      user_id: userId,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Supabase insert post error:', error)
    return res.status(500).json({ error: error.message })
  }

  const inserted = await selectPostById(data.id)

  if (inserted.error) {
    console.error('Supabase fetch inserted post error:', inserted.error)
    return res.status(500).json({ error: inserted.error.message })
  }

  res.status(201).json(normalizePost(inserted.data))
})

export default router

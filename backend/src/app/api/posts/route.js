import express from 'express'
import supabase from '../../lib/supabase.js'
import { getAuth, clerkClient } from '@clerk/express'

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
    author_name: row.author_name ?? null,
    author_avatar: row.author_avatar ?? null,
  }
}

function isMissingRelationshipError(error) {
  return error?.code === 'PGRST200' || error?.message?.includes('relationship')
}

// accept an optional cafe_id filter (used by the /cafes/[id] reviews page)
async function selectPosts(cafeId) {
  // Try with author columns first
  const selectWithAuthor = `${POST_COLUMNS}, author_name, author_avatar, cafes(*)`
  let withCafeAndAuthor = supabase
    .from('posts')
    .select(selectWithAuthor)
    .order('created_at', { ascending: false })
  if (cafeId) withCafeAndAuthor = withCafeAndAuthor.eq('cafe_id', cafeId)
  
  let res = await withCafeAndAuthor
  if (!res.error) return res

  // Fallback: Try without author columns (if they don't exist)
  const select = `${POST_COLUMNS}, cafes(*)`
  let withCafe = supabase
    .from('posts')
    .select(select)
    .order('created_at', { ascending: false })
  if (cafeId) withCafe = withCafe.eq('cafe_id', cafeId)
  res = await withCafe
  if (!res.error || !isMissingRelationshipError(res.error)) return res

  // Final fallback: Plain posts without cafe relationship
  let plain = supabase
    .from('posts')
    .select(POST_COLUMNS)
    .order('created_at', { ascending: false })
  if (cafeId) plain = plain.eq('cafe_id', cafeId)
  return plain
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

// resolve Clerk user ids -> display name/avatar, filling in any missing author info
async function attachClerkAuthors(posts) {
  const ids = [...new Set(
    (posts || [])
      .map((p) => p.user_id)
      .filter((id) => typeof id === 'string' && id.startsWith('user_'))
  )]
  if (ids.length === 0) return posts
  try {
    const resp = await clerkClient.users.getUserList({ userId: ids })
    const users = Array.isArray(resp) ? resp : (resp?.data || [])
    const map = new Map()
    for (const u of users) {
      const name = u.username || u.firstName || u.fullName || null
      map.set(u.id, { name, imageUrl: u.imageUrl || null })
    }
    return posts.map((p) => {
      const found = p.user_id ? map.get(p.user_id) : null
      return {
        ...p,
        author_name: p.author_name || (found?.name ?? null),
        author_avatar: p.author_avatar || (found?.imageUrl ?? null),
      }
    })
  } catch (err) {
    console.error('[posts] clerk author resolve failed:', err)
    return posts
  }
}

// get all posts (+ cafes), optionally filtered by ?cafe_id=
router.get('/', async (req, res) => {
  const cafeId = req.query.cafe_id
  const [postsResult, cafesResult] = await Promise.all([
    selectPosts(cafeId),
    selectCafes(),
  ])

  if (postsResult.error) {
    return res.status(500).json({ error: postsResult.error.message })
  }
  if (cafesResult.error) {
    return res.status(500).json({ error: cafesResult.error.message })
  }

  const posts = await attachClerkAuthors(postsResult.data.map(normalizePost))
  res.json({
    posts,
    cafes: cafesResult.data,
  })
})

router.post('/', async (req, res) => {
  const { userId } = getAuth(req)

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const body = req.body || {}

  // resolve the cafe: accept a direct cafe_id, otherwise look it up by name
  let cafe_id = Number(body.cafe_id)
  if (!Number.isInteger(cafe_id) || cafe_id <= 0) {
    const name = body.cafe_name
    if (!name) {
      return res.status(400).json({ error: 'cafe_id or cafe_name is required' })
    }
    const { data: cafe, error: cafeError } = await supabase
      .from('cafes')
      .select('id')
      .ilike('name', name)
      .maybeSingle()
    if (cafeError) {
      console.error('[posts] cafe lookup failed:', cafeError)
      return res.status(500).json({ error: cafeError.message })
    }
    if (!cafe) return res.status(404).json({ error: `Cafe "${name}" not found` })
    cafe_id = cafe.id
  }

  const rating = Number(body.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be an integer from 1 to 5' })
  }

  // accept either text_review (direct) or description (create-post modal)
  const text_review = (
    typeof body.text_review === 'string' ? body.text_review : (body.description || '')
  ).trim()
  if (!text_review) {
    return res.status(400).json({ error: 'text_review is required' })
  }

  const visitedAt = body.visited_at ? new Date(body.visited_at) : new Date()
  if (Number.isNaN(visitedAt.getTime())) {
    return res.status(400).json({ error: 'visited_at must be a valid date' })
  }

  // normalise photos to a JSON array string (supports multi-photo)
  let photosValue = null
  if (Array.isArray(body.photos)) {
    photosValue = body.photos.length ? JSON.stringify(body.photos) : null
  } else if (typeof body.photos === 'string' && body.photos.trim()) {
    photosValue = JSON.stringify([body.photos.trim()])
  }

  const comments =
    typeof body.comments === 'string' && body.comments.trim()
      ? body.comments.trim()
      : null

  const base = {
    cafe_id,
    rating,
    text_review,
    visited_at: visitedAt.toISOString(),
    photos: photosValue,
    comments,
    user_id: userId,
  }

  // try with denormalized author columns; fall back if they don't exist yet
  const run = (payload) => supabase.from('posts').insert(payload).select('id').single()
  let result = await run({
    ...base,
    author_name: body.author_name || null,
    author_avatar: body.author_avatar || null,
  })
  if (result.error && /author_(name|avatar)/i.test(result.error.message)) {
    result = await run(base)
  }
  const { data, error } = result

  if (error) {
    console.error('[posts] insert failed:', error)
    return res.status(500).json({ error: error.message })
  }

  const inserted = await selectPostById(data.id)
  if (inserted.error) {
    console.error('[posts] fetch inserted failed:', inserted.error)
    return res.status(500).json({ error: inserted.error.message })
  }

  res.status(201).json(normalizePost(inserted.data))
})

export default router

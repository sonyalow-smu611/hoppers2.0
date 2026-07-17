import express from 'express'
import supabase from '../../lib/supabase.js'

const router = express.Router()

// get all posts
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')

  if (error) return res.status(500).json({ error: error.message })
  res.json({ posts: data })
})

router.post('/', async (req, res) => {
  // photos is a public Storage URL uploaded directly from the client
  const { cafe_name, rating, description, visited_at, photos } = req.body || {}

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

  // insert the post
  // NOTE: posts.user_id has no FK and there is no `users` table yet, so we use a
  // placeholder author. Swap for a real Clerk->users lookup once that table exists.
  const PLACEHOLDER_USER_ID = 1
  const { data, error } = await supabase
    .from('posts')
    .insert({
      cafe_id: cafe.id,
      rating: Number(rating),
      text_review: description,
      visited_at: visited_at || new Date().toISOString(),
      photos: photos || null,
      user_id: PLACEHOLDER_USER_ID,
    })
    .select()
    .single()

  if (error) {
    console.error('[posts] insert failed:', error)
    return res.status(500).json({ error: error.message })
  }
  res.status(201).json({ post: data })
})

export default router

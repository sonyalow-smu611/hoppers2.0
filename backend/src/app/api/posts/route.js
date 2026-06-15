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

export default router
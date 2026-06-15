import express from 'express'
import supabase from '../../lib/supabase.js'

const router = express.Router()

// get all lists
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('list')
    .select('*')

  if (error) return res.status(500).json({ error: error.message })
  res.json({ lists: data })
})

export default router
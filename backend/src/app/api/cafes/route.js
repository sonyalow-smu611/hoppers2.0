import express from 'express'
import supabase from '../../lib/supabase.js'

const router = express.Router()

// get all cafes
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('cafes')
    .select('*')

  if (error) return res.status(500).json({ error: error.message })
  res.json({ cafes: data })
})

export default router
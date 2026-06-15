import express from 'express'
import supabase from '../../lib/supabase.js'

const router = express.Router()

// get all users
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')

  if (error) return res.status(500).json({ error: error.message })
  res.json({ users: data })
})

export default router
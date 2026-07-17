import express from 'express'
import supabase from '../../lib/supabase.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('list')
    .select('list_id, title, notes, list_type, user_id, visit_type, cafes(*)')

  if (error) return res.status(500).json({ error: error.message })

  const boards = Object.values(
    data.reduce((acc, row) => {
      const key = `${row.user_id}-${row.title}`
      acc[key] ??= {
        title: row.title,
        notes: row.notes,
        list_type: row.list_type,
        user_id: row.user_id,
        cafes: [],
      }
      acc[key].cafes.push({
        ...row.cafes,
        list_id: row.list_id,
        visit_type: row.visit_type,
      })
      return acc
    }, {})
  )

  res.json({ lists: boards })
})

router.patch('/board/privacy', async (req, res) => {
  const { user_id, title, list_type } = req.body

  const { error } = await supabase
    .from('list')
    .update({ list_type })
    .eq('user_id', user_id)
    .eq('title', title)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ user_id, title, list_type })
})

router.patch('/:id', async (req, res) => {
  const { visit_type } = req.body
  const listId = Number(req.params.id)

  const { error } = await supabase
    .from('list')
    .update({ visit_type })
    .eq('list_id', listId)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ list_id: listId, visit_type })
})

router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('list')
    .delete()
    .eq('list_id', Number(req.params.id))

  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
})

export default router

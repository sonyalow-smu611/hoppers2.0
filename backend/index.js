import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import supabase from './src/app/lib/supabase.js'
import listRoutes from './src/app/api/lists/route.js'
import cafeRoutes from './src/app/api/cafes/route.js' 
import postRoutes from './src/app/api/posts/route.js'
import userRoutes from './src/app/api/users/route.js'
import aiRoutes from './src/app/ai.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/ai', aiRoutes)

app.get('/', (req, res) => {
  res.send('Hoppers backend is running!')
})

app.get('/lists', async (req, res) => {
  const { data, error } = await supabase
    .from('list')
    .select('*')

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.use('/lists', listRoutes)
app.use('/cafes', cafeRoutes)
app.use('/posts', postRoutes)
app.use('/users', userRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


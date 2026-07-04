import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import supabase from './src/app/lib/supabase.js'
import listRoutes from './src/app/api/lists/route.js'
import cafeRoutes from './src/app/api/cafes/route.js' 
import postRoutes from './src/app/api/posts/route.js'
import userRoutes from './src/app/api/users/route.js'
import { clerkMiddleware, clerkClient, getAuth } from '@clerk/express'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000

app.get('/protected', async (req, res) => {
  // Use `getAuth()` to get the user's `userId` and authentication status
  const { isAuthenticated, userId } = getAuth(req)

  // If user isn't authenticated, return a 401 error
  if (!isAuthenticated) {
    res.status(401).json({ error: 'User not authenticated' })
    return
  }

  // Use Clerk's JavaScript Backend SDK to get the user's User object
  const user = await clerkClient.users.getUser(userId)

  res.json({ user })
})

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})

// import aiRoutes from './src/app/ai.js'

// app.use('/ai', aiRoutes)

app.use(clerkMiddleware())

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

app.get('/protected', async (req, res) => {
  // Use `getAuth()` to get the user's `userId` and authentication status
  const { isAuthenticated, userId } = getAuth(req)

  // If user isn't authenticated, return a 401 error
  if (!isAuthenticated) {
    res.status(401).json({ error: 'User not authenticated' })
    return
  }

  // Use Clerk's JavaScript Backend SDK to get the user's User object
  const user = await clerkClient.users.getUser(userId)

  res.json({ user })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})

app.use('/lists', listRoutes)
app.use('/cafes', cafeRoutes)
app.use('/posts', postRoutes)
app.use('/users', userRoutes)



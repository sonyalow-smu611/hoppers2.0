import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import listRoutes from './src/app/api/lists/route.js'
import cafeRoutes from './src/app/api/cafes/route.js'
import postRoutes from './src/app/api/posts/route.js'
import userRoutes from './src/app/api/users/route.js'
import { clerkMiddleware, clerkClient, getAuth } from '@clerk/express'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())

app.get('/', (req, res) => {
  res.send('Hoppers backend is running!')
})

app.get('/protected', async (req, res) => {
  const { isAuthenticated, userId } = getAuth(req)

  if (!isAuthenticated) {
    res.status(401).json({ error: 'User not authenticated' })
    return
  }

  const user = await clerkClient.users.getUser(userId)
  res.json({ user })
})

app.use('/lists', listRoutes)
app.use('/cafes', cafeRoutes)
app.use('/posts', postRoutes)
app.use('/users', userRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

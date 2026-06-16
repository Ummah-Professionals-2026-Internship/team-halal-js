require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

const mentorRoutes = require('./routes/Mentor')
const menteeRoutes = require('./routes/Mentee')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/mentors', mentorRoutes)
app.use('/api/mentees', menteeRoutes)

app.get('/', (req, res) => res.send('Server is running'))

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => console.log('Server running on port ' + PORT))
})

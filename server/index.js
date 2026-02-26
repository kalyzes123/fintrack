import express from 'express'
import cors from 'cors'
import multer from 'multer'
import Tesseract from 'tesseract.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const USERS_FILE = join(__dirname, 'users.json')
const JWT_SECRET = process.env.JWT_SECRET || 'fintrack-mvp-secret-key-change-in-production'

const app = express()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

app.use(cors())
app.use(express.json())

// --- User storage helpers ---
function getUsers() {
  if (!existsSync(USERS_FILE)) return []
  return JSON.parse(readFileSync(USERS_FILE, 'utf-8'))
}

function saveUsers(users) {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

// --- Seed default admin user ---
async function seedAdmin() {
  const users = getUsers()
  if (users.find((u) => u.email === 'admin@fintrack.com')) return
  const hash = await bcrypt.hash('admin123', 10)
  users.push({
    id: crypto.randomUUID(),
    name: 'Admin',
    email: 'admin@fintrack.com',
    password: hash,
    createdAt: new Date().toISOString(),
  })
  saveUsers(users)
  console.log('Seeded admin user: admin@fintrack.com / admin123')
}
seedAdmin()

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// --- Auth endpoints ---
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  const users = getUsers()
  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ error: 'An account with this email already exists' })
  }

  const hash = await bcrypt.hash(password, 10)
  const user = { id: crypto.randomUUID(), name, email, password: hash, createdAt: new Date().toISOString() }
  users.push(user)
  saveUsers(users)

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const users = getUsers()
  const user = users.find((u) => u.email === email)
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

app.get('/api/me', authMiddleware, (req, res) => {
  const users = getUsers()
  const user = users.find((u) => u.id === req.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ id: user.id, name: user.name, email: user.email })
})

app.put('/api/me', authMiddleware, async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body
  const users = getUsers()
  const idx = users.findIndex((u) => u.id === req.userId)
  if (idx === -1) return res.status(404).json({ error: 'User not found' })

  if (name) users[idx].name = name
  if (email) users[idx].email = email

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required' })
    }
    const valid = await bcrypt.compare(currentPassword, users[idx].password)
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }
    users[idx].password = await bcrypt.hash(newPassword, 10)
  }

  saveUsers(users)
  res.json({ id: users[idx].id, name: users[idx].name, email: users[idx].email })
})

// --- Receipt OCR ---
const CATEGORY_KEYWORDS = {
  'Food & Dining': ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'sushi', 'diner', 'bistro', 'grill', 'kitchen', 'bar', 'pub', 'bakery', 'donut'],
  Groceries: ['grocery', 'supermarket', 'market', 'whole foods', 'trader joe', 'costco', 'walmart', 'target', 'safeway', 'kroger', 'aldi', 'food'],
  Transportation: ['gas', 'fuel', 'shell', 'chevron', 'bp', 'exxon', 'uber', 'lyft', 'parking', 'toll', 'transit', 'metro'],
  Housing: ['rent', 'mortgage', 'lease', 'property'],
  Utilities: ['electric', 'water', 'gas bill', 'internet', 'phone', 'cable', 'utility', 'coned', 'verizon', 'comcast', 'att'],
  Entertainment: ['cinema', 'movie', 'theater', 'concert', 'spotify', 'netflix', 'hulu', 'disney', 'game', 'ticket'],
  Shopping: ['amazon', 'ebay', 'store', 'shop', 'mall', 'outlet', 'clothing', 'apparel', 'nike', 'best buy', 'apple'],
  Health: ['pharmacy', 'cvs', 'walgreens', 'doctor', 'hospital', 'clinic', 'dental', 'gym', 'fitness'],
}

function guessCategory(text) {
  const lower = text.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return category
  }
  return 'Other'
}

function extractAmount(text) {
  const subtotalMatch = text.match(/sub\s*-?\s*total[:\s]*\$?([\d,]+\.?\d*)/i)
  if (subtotalMatch) {
    const val = parseFloat(subtotalMatch[1].replace(/,/g, ''))
    if (val > 0) return val
  }

  const labeledPatterns = [
    /(?:amount\s*due|balance\s*due)[:\s]*\$?([\d,]+\.?\d*)/i,
    /(?:total)[:\s]*\$?([\d,]+\.?\d*)/i,
  ]
  for (const pattern of labeledPatterns) {
    const match = text.match(pattern)
    if (match) {
      const val = parseFloat(match[1].replace(/,/g, ''))
      if (val > 0) return val
    }
  }

  const allAmounts = [...text.matchAll(/\$\s*([\d,]+\.\d{2})/g)]
    .map((m) => parseFloat(m[1].replace(/,/g, '')))
    .filter((v) => v > 0)

  if (allAmounts.length > 0) return Math.max(...allAmounts)
  return null
}

function extractDate(text) {
  const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
  if (dateMatch) {
    const month = dateMatch[1].padStart(2, '0')
    const day = dateMatch[2].padStart(2, '0')
    let year = dateMatch[3]
    if (year.length === 2) year = '20' + year
    return `${year}-${month}-${day}`
  }

  const monthNames = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' }
  const namedMatch = text.match(/(\w{3,})\s+(\d{1,2}),?\s*(\d{4})/i)
  if (namedMatch) {
    const monthKey = namedMatch[1].toLowerCase().slice(0, 3)
    if (monthNames[monthKey]) {
      return `${namedMatch[3]}-${monthNames[monthKey]}-${namedMatch[2].padStart(2, '0')}`
    }
  }

  return new Date().toISOString().split('T')[0]
}

function extractDescription(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  for (const line of lines.slice(0, 5)) {
    const cleaned = line.replace(/[^a-zA-Z\s&'.-]/g, '').trim()
    if (cleaned.length >= 3) return cleaned
  }
  return 'Receipt Purchase'
}

app.post('/api/scan-receipt', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng')

    const description = extractDescription(text)
    const amount = extractAmount(text)
    const date = extractDate(text)
    const category = guessCategory(text)

    res.json({ description, amount, date, category, rawText: text })
  } catch (err) {
    console.error('OCR error:', err)
    res.status(500).json({ error: 'Failed to process receipt image' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`FinTrack API server running on http://localhost:${PORT}`)
})

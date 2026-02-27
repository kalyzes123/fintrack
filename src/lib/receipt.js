import Tesseract from 'tesseract.js'

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

// OCR often drops decimal points: $252.00 → s25200, $15.00 → $1500
// This helper extracts a number and tries to restore the decimal
function parseOcrAmount(raw) {
  const num = raw.replace(/,/g, '')
  // If it already has a decimal point, use as-is
  if (num.includes('.')) return parseFloat(num)
  // No decimal: assume last 2 digits are cents (e.g. 25200 → 252.00)
  const n = parseInt(num, 10)
  if (n > 100) return n / 100
  return n
}

function extractAmount(text) {
  const cleaned = text.replace(/\r/g, '')
  const lines = cleaned.split('\n')

  // 1. Search backwards for lines containing "total" — last total is usually grand total
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/total/i.test(lines[i])) {
      // Look for a number on this line (with or without $ or decimal)
      // OCR reads $ as s/S, so match: $252.00, s25200, 252.00, 25200
      const amountMatch = lines[i].match(/[\$sS]?\s*([\d,]+\.?\d*)\s*$/)
      if (amountMatch) {
        const val = parseOcrAmount(amountMatch[1])
        if (val > 0) return val
      }
      // Check next line too
      if (i + 1 < lines.length) {
        const nextMatch = lines[i + 1].match(/[\$sS]?\s*([\d,]+\.?\d*)/)
        if (nextMatch) {
          const val = parseOcrAmount(nextMatch[1])
          if (val > 0) return val
        }
      }
    }
  }

  // 2. Look for subtotal if no total found
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/sub\s*-?\s*total/i.test(lines[i])) {
      const amountMatch = lines[i].match(/[\$sS]?\s*([\d,]+\.?\d*)\s*$/)
      if (amountMatch) {
        const val = parseOcrAmount(amountMatch[1])
        if (val > 0) return val
      }
    }
  }

  // 3. Fallback: find all dollar amounts (with actual $ sign) and pick the largest
  const allAmounts = [...cleaned.matchAll(/\$\s*([\d,]+\.?\d*)/g)]
    .map((m) => parseOcrAmount(m[1]))
    .filter((v) => v > 0.5)

  if (allAmounts.length > 0) return Math.max(...allAmounts)
  return null
}

function extractDate(text) {
  // MM/DD/YYYY or MM-DD-YYYY
  const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
  if (dateMatch) {
    const month = dateMatch[1].padStart(2, '0')
    const day = dateMatch[2].padStart(2, '0')
    let year = dateMatch[3]
    if (year.length === 2) year = '20' + year
    return `${year}-${month}-${day}`
  }

  // Named month: "Nov 4, 2025"
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

export async function scanReceipt(file) {
  const { data: { text } } = await Tesseract.recognize(file, 'eng')
  console.log('OCR raw text:', text)

  const description = extractDescription(text)
  const amount = extractAmount(text)
  const date = extractDate(text)
  const category = guessCategory(text)

  return { description, amount, date, category }
}

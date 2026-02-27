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

function extractAmount(text) {
  // Look for "Total" with a dollar amount on the same line (prefer last/largest "total")
  const totalMatches = [...text.matchAll(/total[^$\n]*\$\s*([\d,]+\.\d{2})/gi)]
  if (totalMatches.length > 0) {
    // Pick the last "total" match — usually the grand total
    const val = parseFloat(totalMatches[totalMatches.length - 1][1].replace(/,/g, ''))
    if (val > 0) return val
  }

  // Look for labeled amounts
  const labeledPatterns = [
    /(?:amount\s*due|balance\s*due|grand\s*total)[:\s]*\$?\s*([\d,]+\.\d{2})/i,
    /(?:total)[:\s]+\$?\s*([\d,]+\.\d{2})/i,
  ]
  for (const pattern of labeledPatterns) {
    const match = text.match(pattern)
    if (match) {
      const val = parseFloat(match[1].replace(/,/g, ''))
      if (val > 0) return val
    }
  }

  // Fallback: find all dollar amounts and pick the largest
  const allAmounts = [...text.matchAll(/\$\s*([\d,]+\.\d{2})/g)]
    .map((m) => parseFloat(m[1].replace(/,/g, '')))
    .filter((v) => v > 0)

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

  const description = extractDescription(text)
  const amount = extractAmount(text)
  const date = extractDate(text)
  const category = guessCategory(text)

  return { description, amount, date, category }
}

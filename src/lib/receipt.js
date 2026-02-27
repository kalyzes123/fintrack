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
  // Normalize: OCR may read $ as S or s, collapse whitespace
  const cleaned = text.replace(/\r/g, '')

  // 1. Look for "Total" near a dollar amount (same line or next line)
  const totalPatterns = [
    /total\s*\(?USD\)?[^0-9\n]*[\$S]?\s*([\d,]+\.\d{2})/gi,
    /total[^0-9\n]*[\$S]?\s*([\d,]+\.\d{2})/gi,
    /(?:amount\s*due|balance\s*due|grand\s*total)[^0-9\n]*[\$S]?\s*([\d,]+\.\d{2})/gi,
  ]

  for (const pattern of totalPatterns) {
    const matches = [...cleaned.matchAll(pattern)]
    if (matches.length > 0) {
      const val = parseFloat(matches[matches.length - 1][1].replace(/,/g, ''))
      if (val > 0) return val
    }
  }

  // 2. Look line by line for a line containing "total" and a number
  const lines = cleaned.split('\n')
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/total/i.test(lines[i])) {
      const amountMatch = lines[i].match(/([\d,]+\.\d{2})/)
      if (amountMatch) {
        const val = parseFloat(amountMatch[1].replace(/,/g, ''))
        if (val > 0) return val
      }
      // Check next line too (amount might be on the line below "Total")
      if (i + 1 < lines.length) {
        const nextMatch = lines[i + 1].match(/([\d,]+\.\d{2})/)
        if (nextMatch) {
          const val = parseFloat(nextMatch[1].replace(/,/g, ''))
          if (val > 0) return val
        }
      }
    }
  }

  // 3. Fallback: find all dollar amounts and pick the largest
  const allAmounts = [...cleaned.matchAll(/[\$S]?\s*([\d,]+\.\d{2})/g)]
    .map((m) => parseFloat(m[1].replace(/,/g, '')))
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

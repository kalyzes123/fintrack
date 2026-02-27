import Tesseract from 'tesseract.js'

const CATEGORY_KEYWORDS = {
  'Food & Dining': ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'sushi', 'diner', 'bistro', 'grill', 'kitchen', 'bar', 'pub', 'bakery', 'donut', 'starbucks', 'mcdonald', 'kfc', 'nasi', 'mamak', 'kopitiam'],
  Groceries: ['grocery', 'supermarket', 'market', 'whole foods', 'trader joe', 'costco', 'walmart', 'target', 'safeway', 'kroger', 'aldi', 'food', 'aeon', 'giant', 'tesco', 'mydin', 'jaya grocer', '99 speedmart'],
  Transportation: ['gas', 'fuel', 'shell', 'chevron', 'bp', 'exxon', 'uber', 'lyft', 'parking', 'toll', 'transit', 'metro', 'grab', 'petronas', 'petron'],
  Housing: ['rent', 'mortgage', 'lease', 'property'],
  Utilities: ['electric', 'water', 'gas bill', 'internet', 'phone', 'cable', 'utility', 'coned', 'verizon', 'comcast', 'att', 'tenaga', 'unifi', 'maxis', 'celcom', 'digi'],
  Entertainment: ['cinema', 'movie', 'theater', 'concert', 'spotify', 'netflix', 'hulu', 'disney', 'game', 'ticket', 'gsc', 'tgv'],
  Shopping: ['amazon', 'ebay', 'store', 'shop', 'mall', 'outlet', 'clothing', 'apparel', 'nike', 'best buy', 'apple', 'lazada', 'shopee', 'uniqlo', 'mr diy'],
  Health: ['pharmacy', 'cvs', 'walgreens', 'doctor', 'hospital', 'clinic', 'dental', 'gym', 'fitness', 'guardian', 'watsons'],
}

function guessCategory(text) {
  const lower = text.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return category
  }
  return 'Other'
}

// OCR often drops decimal points or misreads currency symbols
function parseOcrAmount(raw) {
  const num = raw.replace(/,/g, '')
  if (num.includes('.')) return parseFloat(num)
  // No decimal: assume last 2 digits are cents (e.g. 2325 → 23.25)
  const n = parseInt(num, 10)
  if (n > 100) return n / 100
  return n
}

// Currency prefix pattern: RM, $, or OCR misreads like s/S
const CURRENCY_PREFIX = /(?:RM|rm|Rm|\$|[sS])\s*/

function extractAmount(text) {
  const cleaned = text.replace(/\r/g, '')
  const lines = cleaned.split('\n')

  // 1. Search backwards for lines containing "total" — last total is usually grand total
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/total/i.test(lines[i])) {
      // Match currency prefix (RM, $, s) followed by amount
      const amountMatch = lines[i].match(new RegExp(CURRENCY_PREFIX.source + '(-?[\\d,]+\\.?\\d*)', 'i'))
      if (amountMatch) {
        const val = parseOcrAmount(amountMatch[1].replace('-', ''))
        if (val > 0) return val
      }
      // Also try: just a number at the end of the line
      const endMatch = lines[i].match(/([\d,]+\.?\d+)\s*$/)
      if (endMatch) {
        const val = parseOcrAmount(endMatch[1])
        if (val > 0) return val
      }
      // Check next line too (amount might be on the line below "Total")
      if (i + 1 < lines.length) {
        const nextMatch = lines[i + 1].match(new RegExp(CURRENCY_PREFIX.source + '(-?[\\d,]+\\.?\\d*)', 'i'))
        if (nextMatch) {
          const val = parseOcrAmount(nextMatch[1].replace('-', ''))
          if (val > 0) return val
        }
      }
    }
  }

  // 2. Look for subtotal if no total found
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/sub\s*-?\s*total/i.test(lines[i])) {
      const amountMatch = lines[i].match(new RegExp(CURRENCY_PREFIX.source + '([\\d,]+\\.?\\d*)', 'i'))
      if (amountMatch) {
        const val = parseOcrAmount(amountMatch[1])
        if (val > 0) return val
      }
    }
  }

  // 3. Fallback: find all amounts with RM or $ prefix and pick the largest
  const currencyPattern = new RegExp(CURRENCY_PREFIX.source + '([\\d,]+\\.?\\d+)', 'gi')
  const allAmounts = [...cleaned.matchAll(currencyPattern)]
    .map((m) => parseOcrAmount(m[1]))
    .filter((v) => v > 0.5)

  if (allAmounts.length > 0) return Math.max(...allAmounts)
  return null
}

const MONTH_NAMES = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' }

function extractDate(text) {
  // Named month with 2 or 4 digit year: "24 Sep 18", "24 Sep 2018", "Sep 24, 2018"
  // Pattern 1: DD Mon YY(YY)
  const dmy = text.match(/(\d{1,2})\s+(\w{3,})\s+(\d{2,4})/)
  if (dmy) {
    const monthKey = dmy[2].toLowerCase().slice(0, 3)
    if (MONTH_NAMES[monthKey]) {
      let year = dmy[3]
      if (year.length === 2) year = '20' + year
      return `${year}-${MONTH_NAMES[monthKey]}-${dmy[1].padStart(2, '0')}`
    }
  }

  // Pattern 2: Mon DD, YY(YY)
  const mdy = text.match(/(\w{3,})\s+(\d{1,2}),?\s*(\d{2,4})/i)
  if (mdy) {
    const monthKey = mdy[1].toLowerCase().slice(0, 3)
    if (MONTH_NAMES[monthKey]) {
      let year = mdy[3]
      if (year.length === 2) year = '20' + year
      return `${year}-${MONTH_NAMES[monthKey]}-${mdy[2].padStart(2, '0')}`
    }
  }

  // Pattern 3: MM/DD/YYYY or DD-MM-YYYY etc
  const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
  if (dateMatch) {
    const month = dateMatch[1].padStart(2, '0')
    const day = dateMatch[2].padStart(2, '0')
    let year = dateMatch[3]
    if (year.length === 2) year = '20' + year
    return `${year}-${month}-${day}`
  }

  return new Date().toISOString().split('T')[0]
}

function extractDescription(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  // Skip lines that are just noise (short, mostly numbers, addresses, tax IDs)
  const skipPatterns = [/^\d+$/, /tax\s*id/i, /invoice/i, /receipt\s*#/i, /^date/i, /www\./i, /^\(?\d{3}\)?/, /lot\s+\d/i]

  for (const line of lines.slice(0, 10)) {
    const cleaned = line.replace(/[^a-zA-Z\s&'.-]/g, '').trim()
    // Must be at least 4 chars and not a skip pattern
    if (cleaned.length >= 4 && !skipPatterns.some((p) => p.test(line))) {
      return cleaned
    }
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

const API_URL = 'http://localhost:3001'

export async function scanReceipt(file) {
  const formData = new FormData()
  formData.append('receipt', file)

  const res = await fetch(`${API_URL}/api/scan-receipt`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to scan receipt')
  }

  return res.json()
}

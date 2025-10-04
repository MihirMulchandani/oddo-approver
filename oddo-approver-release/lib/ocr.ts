import { createWorker } from 'tesseract.js'

export interface OCRResult {
  text: string
  confidence: number
  amount?: number
  currency?: string
  date?: string
}

export async function extractTextFromImage(imageFile: File): Promise<OCRResult> {
  try {
    const worker = await createWorker('eng')
    
    const { data: { text, confidence } } = await worker.recognize(imageFile)
    
    await worker.terminate()

    // Extract structured data from OCR text
    const extractedData = extractStructuredData(text)

    return {
      text,
      confidence,
      ...extractedData,
    }
  } catch (error) {
    console.error('OCR processing error:', error)
    throw new Error('Failed to process image with OCR')
  }
}

function extractStructuredData(text: string): Partial<OCRResult> {
  const result: Partial<OCRResult> = {}

  // Extract currency amount (look for patterns like $123.45, 123.45 USD, etc.)
  const amountPatterns = [
    /\$(\d+(?:\.\d{2})?)/g, // $123.45
    /(\d+(?:\.\d{2})?)\s*(USD|EUR|GBP|JPY|CAD|AUD)/gi, // 123.45 USD
    /(\d+(?:\.\d{2})?)\s*(\$|€|£|¥)/g, // 123.45 $, 123.45 €
  ]

  for (const pattern of amountPatterns) {
    const match = text.match(pattern)
    if (match) {
      const amountStr = match[0].replace(/[^\d.]/g, '')
      const amount = parseFloat(amountStr)
      if (!isNaN(amount)) {
        result.amount = amount
        break
      }
    }
  }

  // Extract currency
  const currencyPatterns = [
    /\b(USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|INR|BRL|MXN|SGD|HKD)\b/gi,
    /[\$€£¥]/g,
  ]

  for (const pattern of currencyPatterns) {
    const match = text.match(pattern)
    if (match) {
      const currency = match[0].toUpperCase()
      if (currency.length === 3) {
        result.currency = currency
      } else {
        // Map symbols to currencies
        const symbolMap: { [key: string]: string } = {
          '$': 'USD',
          '€': 'EUR',
          '£': 'GBP',
          '¥': 'JPY',
        }
        result.currency = symbolMap[currency] || 'USD'
      }
      break
    }
  }

  // Extract date (look for common date patterns)
  const datePatterns = [
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/g, // MM/DD/YYYY or DD/MM/YYYY
    /\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/g, // YYYY/MM/DD
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi, // Month DD, YYYY
  ]

  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      result.date = match[0]
      break
    }
  }

  return result
}

export function validateOCRResult(result: OCRResult): boolean {
  return !!(result.text && result.confidence > 30)
}

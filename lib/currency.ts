const EXCHANGE_RATE_API_URL = process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate.host/convert'

export interface CurrencyConversion {
  from: string
  to: string
  amount: number
  convertedAmount: number
  rate: number
}

export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string = 'USD'
): Promise<CurrencyConversion> {
  try {
    // If same currency, return as is
    if (fromCurrency === toCurrency) {
      return {
        from: fromCurrency,
        to: toCurrency,
        amount,
        convertedAmount: amount,
        rate: 1,
      }
    }

    const response = await fetch(
      `${EXCHANGE_RATE_API_URL}?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
    )

    if (!response.ok) {
      throw new Error(`Currency conversion failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(`Currency conversion failed: ${data.error?.info || 'Unknown error'}`)
    }

    return {
      from: fromCurrency,
      to: toCurrency,
      amount,
      convertedAmount: data.result,
      rate: data.info.rate,
    }
  } catch (error) {
    console.error('Currency conversion error:', error)
    // Fallback: return original amount with a warning
    return {
      from: fromCurrency,
      to: toCurrency,
      amount,
      convertedAmount: amount,
      rate: 1,
    }
  }
}

export const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL', 'MXN', 'SGD', 'HKD', 'NOK', 'SEK', 'DKK', 'PLN', 'CZK', 'HUF', 'RUB'
]

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

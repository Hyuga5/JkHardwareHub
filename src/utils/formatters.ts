import { Language } from '../types';

/**
 * Format currency in Nepali/South Asian numbering system (e.g. Rs. 1,45,200.00)
 */
export function formatNPR(amount: number, language: Language = 'en'): string {
  if (isNaN(amount)) amount = 0;
  
  // Format with South Asian digit groupings (Lakhs, Crores)
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const fixed = absAmount.toFixed(2);
  const [integerPart, decimalPart] = fixed.split('.');
  
  let formattedInteger = '';
  if (integerPart.length <= 3) {
    formattedInteger = integerPart;
  } else {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    const groupedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formattedInteger = `${groupedOthers},${lastThree}`;
  }

  const sign = isNegative ? '-' : '';

  if (language === 'ne') {
    // Nepali digit conversion
    const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    const nepaliFormatted = `${formattedInteger}.${decimalPart}`.replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
    return `${sign}रू ${nepaliFormatted}`;
  }

  return `${sign}Rs. ${formattedInteger}.${decimalPart}`;
}

export function formatCompactNPR(amount: number): string {
  if (amount >= 10000000) {
    return `Rs. ${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `Rs. ${(amount / 100000).toFixed(2)} L`;
  }
  if (amount >= 1000) {
    return `Rs. ${(amount / 1000).toFixed(1)}k`;
  }
  return `Rs. ${amount.toFixed(0)}`;
}

/**
 * Calculate Nepal VAT breakdown (13% Standard rate)
 */
export function calculateVatBreakdown(
  items: { price: number; quantity: number; isVatExempt?: boolean }[]
) {
  let taxableSubtotal = 0;
  let exemptSubtotal = 0;

  for (const item of items) {
    const total = item.price * item.quantity;
    if (item.isVatExempt) {
      exemptSubtotal += total;
    } else {
      taxableSubtotal += total;
    }
  }

  const vatAmount = Math.round(taxableSubtotal * 0.13 * 100) / 100;
  const grandTotal = taxableSubtotal + exemptSubtotal + vatAmount;

  return {
    taxableSubtotal,
    exemptSubtotal,
    vatAmount,
    grandTotal,
    vatRate: 0.13,
  };
}

/**
 * Get current Nepali Fiscal Year (Shrawan 1 to Ashadh end)
 * Mid July to Mid July
 */
export function getNepaliFiscalYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed: 6 is July

  // Approximate BS year conversion: AD 2026 is BS 2083
  // Mid July (month >= 6) is the start of the next FY
  const bsYear = year + 57;
  if (month >= 6) {
    return `${bsYear}/${(bsYear + 1).toString().slice(-2)}`;
  } else {
    return `${bsYear - 1}/${bsYear.toString().slice(-2)}`;
  }
}

export function generateInvoiceNumber(prefix = 'INV'): string {
  const random = Math.floor(10000 + Math.random() * 90000);
  const fy = getNepaliFiscalYear().replace('/', '-');
  return `${prefix}-${fy}-${random}`;
}

export function generateVoucherNumber(type: string): string {
  const p = type.toUpperCase().slice(0, 3);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${p}-${random}`;
}

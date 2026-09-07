/**
 * Formats a monetary amount into Indian Rupee format (e.g. ₹45,250.50 or ₹45,250)
 */
export const formatCurrency = (amount, includeDecimals = false) => {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

/**
 * Formats YYYY-MM-DD or ISO date string into readable formats
 */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateGroupHeader = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatMonthYearHeader = (year, monthIndex) => {
  const date = new Date(year, monthIndex, 1);
  return date.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Generates a clean 6-character random household invite code (e.g. GHARK-9X2L)
 */
export const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 5; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GK-${random}`;
};

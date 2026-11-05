/**
 * Utility functions for formatting numbers, currency, and dates.
 */

export const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  return `$${amount.toFixed(2)}`;
};

export const formatDiscountPrice = (price, discountPercentage) => {
  if (!discountPercentage) return formatCurrency(price);
  const discounted = price * (1 - discountPercentage / 100);
  return formatCurrency(discounted);
};

export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

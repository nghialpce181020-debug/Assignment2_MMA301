/**
 * Project: MMA301 Assignment 2 - Integrated E-Commerce Mobile App
 * Tác giả: Lê Phước Nghĩa
 * MSSV: CE181020
 * Git Account: nghialpce181020-debug
 * Module / Requirement: R04, R06 - Data Transformation & Currency Formatter
 * Ý nghĩa & Mục đích: Cung cấp các hàm định dạng giá tiền USD ($), tính giá khuyến mãi sau giảm và định dạng ngày tháng.
 */

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

export function formatMoney(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '-';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));
}
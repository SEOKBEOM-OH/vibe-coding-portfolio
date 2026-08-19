export function formatPrice(value) {
  return `${value.toLocaleString()}원`
}

export function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${hours}:${minutes}`
}

export function optionKey(options) {
  return options
    .map((option) => option.id)
    .sort()
    .join(',')
}

export function optionLabel(options) {
  if (!options.length) return ''
  return ` (${options.map((option) => option.label).join(', ')})`
}

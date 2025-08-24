/**
 * Функция для получения инициалов из строки (имени пользователя).
 * Возвращает первые буквы первых двух слов в верхнем регистре.
 * Если имя пустое — возвращает пустую строку.
 *
 * @param name - строка с именем пользователя
 * @returns инициалы в верхнем регистре
 */
export const getInitials = (name: string): string => {
  if (!name) return ''
  const words = name.trim().split(/\s+/)
  if (words.length === 0) return ''

  const initials = words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
  return initials.toUpperCase()
}


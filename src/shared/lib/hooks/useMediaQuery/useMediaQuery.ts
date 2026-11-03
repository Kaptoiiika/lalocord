import { useEffect, useState } from 'react'

const getMediaQueryMatches = (query: string) => {
  if (typeof window === 'undefined') return false

  return window.matchMedia(query).matches
}

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => getMediaQueryMatches(query))

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    const handleChange = () => {
      setMatches(mediaQueryList.matches)
    }

    handleChange()
    mediaQueryList.addEventListener('change', handleChange)

    return () => {
      mediaQueryList.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}

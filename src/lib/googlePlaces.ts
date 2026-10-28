// src/lib/googlePlaces.ts
export interface GooglePlaceRating {
  rating: number
  reviewCount: number
}

/** Récupère la note moyenne et le nombre d'avis Google pour un Place ID donné. */
export async function fetchGooglePlaceRating(placeId: string): Promise<GooglePlaceRating | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey || !placeId) return null

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=rating,user_ratings_total&key=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 'OK' || typeof data.result?.rating !== 'number') return null
    return {
      rating: data.result.rating,
      reviewCount: data.result.user_ratings_total ?? 0,
    }
  } catch {
    return null
  }
}

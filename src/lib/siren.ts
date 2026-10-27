// src/lib/siren.ts

export interface SirenResult {
  valid: boolean
  data?: {
    siren: string
    companyName: string
    legalCategory: string
    activity: string
    status: string
    active: boolean
  }
  error?: string
}

// Validation algorithmique (algorithme de Luhn adapté)
export function validateSirenFormat(siren: string): boolean {
  const cleaned = siren.replace(/\s/g, '')
  if (!/^\d{9}$/.test(cleaned)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(cleaned[i])
    if (i % 2 === 1) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  return sum % 10 === 0
}

// Vérification via l'API SIRENE de l'INSEE (publique, sans clé)
export async function verifySiren(siren: string): Promise<SirenResult> {
  const cleaned = siren.replace(/\s/g, '')

  if (!validateSirenFormat(cleaned)) {
    return { valid: false, error: 'Format SIREN invalide (9 chiffres requis)' }
  }

  try {
    const res = await fetch(
      `https://api.insee.fr/entreprises/sirene/V3/siren/${cleaned}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SIRENE_API_KEY}`,
          Accept: 'application/json',
        },
        next: { revalidate: 3600 },
      }
    )

    // Fallback: utiliser l'API entreprise.data.gouv.fr (sans auth)
    if (res.status === 401 || res.status === 403 || !process.env.SIRENE_API_KEY) {
      return verifySirenFallback(cleaned)
    }

    if (res.status === 404) {
      return { valid: false, error: 'SIREN non trouvé dans le répertoire SIRENE' }
    }

    if (!res.ok) {
      return verifySirenFallback(cleaned)
    }

    const data = await res.json()
    const unite = data.uniteLegale

    return {
      valid: true,
      data: {
        siren: cleaned,
        companyName:
          unite.periodesUniteLegale?.[0]?.denominationUniteLegale ||
          `${unite.periodesUniteLegale?.[0]?.prenomUsuelUniteLegale || ''} ${unite.periodesUniteLegale?.[0]?.nomUniteLegale || ''}`.trim(),
        legalCategory: unite.periodesUniteLegale?.[0]?.categorieJuridiqueUniteLegale || '',
        activity: unite.periodesUniteLegale?.[0]?.activitePrincipaleUniteLegale || '',
        status: unite.periodesUniteLegale?.[0]?.etatAdministratifUniteLegale || 'A',
        active: unite.periodesUniteLegale?.[0]?.etatAdministratifUniteLegale === 'A',
      },
    }
  } catch {
    return verifySirenFallback(cleaned)
  }
}

// Fallback: entreprise.data.gouv.fr (open data, sans clé)
async function verifySirenFallback(siren: string): Promise<SirenResult> {
  try {
    const res = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${siren}&page=1&per_page=1`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error('API unavailable')
    const data = await res.json()
    const results = data.results || []
    const company = results.find((r: { siren: string }) => r.siren === siren)

    if (!company) {
      return { valid: false, error: 'Entreprise non trouvée' }
    }

    return {
      valid: true,
      data: {
        siren,
        companyName: company.nom_complet || company.nom_raison_sociale || 'Nom inconnu',
        legalCategory: company.nature_juridique || '',
        activity: company.activite_principale || '',
        status: company.etat_administratif || 'A',
        active: company.etat_administratif === 'A',
      },
    }
  } catch {
    // En dernier recours, on accepte si le format est valide
    return {
      valid: true,
      data: {
        siren,
        companyName: '',
        legalCategory: '',
        activity: '',
        status: 'A',
        active: true,
      },
      error: 'Vérification en ligne indisponible — format valide',
    }
  }
}

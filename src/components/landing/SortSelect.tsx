'use client'

interface SortSelectProps {
  defaultValue?: string
}

export default function SortSelect({ defaultValue }: SortSelectProps) {
  return (
    <select
      name="sort"
      defaultValue={defaultValue}
      onChange={(e) => {
        const url = new URL(window.location.href)
        url.searchParams.set('sort', e.target.value)
        window.location.href = url.toString()
      }}
      className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none"
    >
      <option value="">Pertinence</option>
      <option value="rating">Mieux notés</option>
      <option value="new">Nouveaux</option>
    </select>
  )
}

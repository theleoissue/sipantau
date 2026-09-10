import { Children, cloneElement, isValidElement, type ReactNode, type ReactElement } from 'react'

type Elemen = ReactElement<{ children?: ReactNode; 'data-label'?: ReactNode; role?: string }>

/** Satu sumber data untuk tabel desktop dan kartu berlabel di layar kecil. */
export function TabelResponsif({ children }: { children: ReactNode }) {
  const bagian = Children.toArray(children)
  const kepala = bagian.find(b => isValidElement(b) && b.type === 'thead') as Elemen | undefined
  const barisKepala = Children.toArray(kepala?.props.children).find(isValidElement) as Elemen | undefined
  const label = Children.toArray(barisKepala?.props.children).filter(isValidElement)
    .map(b => (b as Elemen).props.children)
  return <table className="tabel-responsif" role="table">
    {bagian.map(b => {
      if (!isValidElement(b) || b.type !== 'tbody') return b
      return cloneElement(b as Elemen, { role: 'rowgroup' }, Children.map((b as Elemen).props.children, row => {
        if (!isValidElement(row)) return row
        return cloneElement(row as Elemen, { role: 'row' }, Children.toArray((row as Elemen).props.children).map((cell, i) =>
          isValidElement(cell) ? cloneElement(cell as Elemen, { 'data-label': label[i] || 'Tindakan', role: 'cell' }) : cell))
      }))
    })}
  </table>
}

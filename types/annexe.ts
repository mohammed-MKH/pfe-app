export type AnnexeRowType = "cat" | "item"
export type UniteType     = "U" | "m" | "F"

export interface AnnexeRow {
  rowId:      string
  adminId:    string
  annexeId:   string
  type:       AnnexeRowType
  num:        string
  designation: string
  unite:      UniteType
  qte:        number
  qte01:      number
  qte02:      number
  qte03:      number
  prixU:      number
  order:      number
  updatedBy:  string
  updatedAt:  number
}

export interface Annexe {
  annexeId:    string
  adminId:     string
  title:       string
  description: string
  createdBy:   string
  createdAt:   number
  sharedWith:  string[]
  isLocked:    boolean
}

// Calculated fields — never stored in Firestore
export interface AnnexeRowComputed extends AnnexeRow {
  rest:      number
  prixTotal: number
}

export function calcRest(row: AnnexeRow): number {
  if (row.type === "cat") return 0
  return row.qte - row.qte01 - row.qte02 - row.qte03
}

export function calcPrixTotal(row: AnnexeRow): number {
  if (row.type === "cat") return 0
  const delivered = row.qte01 + row.qte02 + row.qte03
  return delivered * row.prixU
}

export function toComputed(row: AnnexeRow): AnnexeRowComputed {
  return {
    ...row,
    rest:      calcRest(row),
    prixTotal: calcPrixTotal(row),
  }
}
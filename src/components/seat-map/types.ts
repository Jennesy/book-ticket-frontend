export interface Seat {
  row: string
  col: number
  text: string
  status: string
  price?: number
  reservedBy?: string
}

export interface SeatSection {
  text?: string
  class: string | string[] | { [key: string]: boolean }
  status?: string
  reservedBy?: string
  row?: string
  col?: number
}

export interface SectionRow {
  row: string
  col: number
}

export type SeatPriceColor = {
  [key: string]: {
    [status: string]: string
  }
} 

export type SeatMapMode = 'view' | 'book' | 'edit'
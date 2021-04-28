export interface Node {
  id: string
  name: string
  spouse?: string
  area?: string,
  shape?: string,
  group?: number
  radiusSize?: number
  fillColor?: string
}

export interface Link {
  source: string
  target: string
  relation: string
  linknum?: number
}

export interface DataObject {
  nodes: Node[]
  links: Link[]
}

export interface Point {
  x: number
  y: number
}

export interface Datum {
  x: number
  y: number
  fx: number | null
  fy: number | null
}

import { wrap } from './utils.js'

export const VON_NEUMANN = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: 0, y: 1 },
]

export const EXPANDED_VON_NEUMANN = VON_NEUMANN.map(p => ({
  x: p.x * 2,
  y: p.y * 2,
})).concat(VON_NEUMANN)

export const MOORE = []
for (let y = -1; y <= 1; y++)
  for (let x = -1; x <= 1; x++) if (x || y) MOORE.push({ x, y })

export class Grid2D {
  constructor(width, height = width, init = () => 0, wrap = false) {
    this.width = width
    this.height = height
    this.init = init
    this.data = Array.from({ length: this.height }, (_, y) =>
      Array.from({ length: this.width }, (_, x) => this.init({ x, y }, this))
    )
    this.wrap = wrap
    if (wrap) console.log(wrap)
  }
  get size() {
    return this.width * this.height
  }
  fill(value) {
    this.data = Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => value)
    )
  }
  clear() {
    this.fill(0)
  }
  delete(position) {
    this.set(position, this.init(position))
  }
  get(position) {
    return this.data[position.y][position.x]
  }
  has(position) {
    return (
      position.x >= 0 &&
      position.x < this.width &&
      position.y >= 0 &&
      position.y < this.height
    )
  }
  set(position, value) {
    this.data[position.y][position.x] = value
  }
  *keys() {
    for (let y = 0; y < this.data.length; y++) {
      for (let x = 0; x < this.data[y].length; x++) {
        yield { x, y }
      }
    }
  }
  *entries() {
    for (const position of this.keys()) {
      yield [position, this.get(position)]
    }
  }
  *values() {
    for (const row of this.data) yield* row
  }
  *[Symbol.iterator]() {
    yield* this.entries()
  }
  *neighbours(position, neighbourhood = MOORE) {
    yield* neighbourhood
      .map(offset => {
        const p = { x: position.x + offset.x, y: position.y + offset.y }
        if (this.wrap) {
          p.x %= this.width
          p.y %= this.height
        }
        return p
      })
      .filter(
        ({ x, y }) => x >= 0 && y >= 0 && x < this.width && y < this.height
      )
  }
  *neighbourValues(position, neighbourhood = MOORE) {
    for (const n of this.neighbours(position, neighbourhood)) {
      yield this.get(n)
    }
  }
  toString(colSep = ',', rowSep = '\n') {
    return this.data.map(row => row.join(colSep)).join(rowSep)
  }
  static fromString(str, colSep = ',', rowSep = '\n') {
    const grid = str.split(rowSep).map(row => row.split(colSep).map(Number))
    if (grid.every(g => g.length === grid[0].length)) {
      return new Grid2D(grid.length, grid[0].length, ({x, y}) => grid[y][x])
    } else {
      throw Error('Rows must be equal in length.')
    }
  }
  [Symbol.toStringTag]() {
    return 'Grid2D'
  }
  copy() {
    return new Grid2D(this.width, this.height, this.get.bind(this))
  }
  map(fn) {
    return new Grid2D(this.width, this.height, pos =>
      fn(this.get(pos), pos, this)
    )
  }
  forEach(fn) {
    for (const p of this) fn(p[1], p[0], this)
  }
  reduce(fn, init) {
    return Array.from(this.values()).reduce(fn, init)
  }
}

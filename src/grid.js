import { wrap } from './utils.js'
import { MOORE } from './neighbourhood.js'
import { Position } from './position.js'

export class Grid2D {
  constructor(options) {
    if (
      !['width', 'height'].every(
        v => options[v] > 0 && Number.isInteger(options[v])
      )
    ) {
      throw Error('Grid2D: Needs width and height for constructor')
    }
    this.width = options.width
    this.height = options.height
    if ('data' in options) {
      this.data = JSON.parse(JSON.stringify(options.data))
    } else {
      this.fill(options.init || 0)
    }
    this.wrap = options.wrap || false
  }

  get size() {
    return this.width * this.height
  }
  fill(value = 0) {
    this.data = Array.from({ length: this.height }, () =>
      Array.from(
        { length: this.width },
        typeof value === 'function' ? value : () => value
      )
    )
  }
  clear() {
    this.fill(0)
  }
  delete(position) {
    this.set(position, 0)
  }
  get(position) {
    if (Position.isPosition(position)) {
      return this.data[position.y][position.x]
    } else {
      throw Error('Invalid position')
    }
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
    if (Position.isPosition(position)) {
      this.data[position.y][position.x] = value
    } else {
      throw Error('Invalid position')
    }
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
  toString(colSep = ',', rowSep = '\n', stringMap = '01') {
    if (!this.data) console.trace(this)
    return this.data.map(row => row.join(colSep)).join(rowSep)
  }
  static fromString(
    str,
    stringMap = '0123456789',
    colSep = ',',
    rowSep = '\n'
  ) {
    const grid = {
      data: str
        .trim()
        .split(rowSep)
        .map(row =>
          row
            .trim()
            .split(colSep)
            .map(char => stringMap.indexOf(char))
        ),
    }

    if (
      grid.data.length &&
      grid.data.every(g => g.length === grid.data[0].length)
    ) {
      grid.width = grid.data[0].length
      grid.height = grid.data.length
      return new Grid2D(grid)
    } else {
      throw Error('Rows must be equal in length.')
    }
  }
  [Symbol.toStringTag]() {
    return 'Grid2D'
  }
  copy() {
    return new Grid2D(this)
  }
  map(fn) {
    const grid = this.copy()
    grid.forEach((value, position) =>
      grid.set(position, fn(value, position, grid))
    )
    return grid
  }
  forEach(fn) {
    for (const [value, position] of this) fn(position, value, this)
  }
  reduce(fn, init) {
    return Array.from(this.values()).reduce(fn, init)
  }
}

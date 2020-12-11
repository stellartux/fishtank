import { MOORE } from './neighbourhood.js'
import { Position } from './position.js'
/** @typedef {import('./neighbourhood.js').Neighbourhood} Neighbourhood */

export class Grid2D {
  /**
   * @param {object} options
   * @param {number} options.height how many rows the grid should have
   * @param {number} options.width how many columns the grid should have
   * @param {string | any[][]?} [options.data] an optional initial state for the grid to be in
   * @param {number?} [options.init = 0] if data is not declared, the initial value of all cells, defaults to 0
   * @param {boolean?} [options.wrap = false] whether neighbourhoods should wrap at the edges, defaults to false
   */
  constructor(options) {
    if (
      !['width', 'height'].every(
        (v) => options[v] > 0 && Number.isInteger(options[v])
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
    this.wrap = !!options.wrap
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

  /**
   * @param {Position} position
   */
  delete(position) {
    this.set(position, 0)
  }

  /**
   * @param {Position} position
   */
  get(position) {
    if (this.wrap) {
      position = Position.wrap(
        position,
        { x: 0, y: 0 },
        { x: this.width, y: this.height }
      )
    }
    if (this.has(position)) {
      return this.data[position.y][position.x]
    } else {
      throw Error('Invalid position')
    }
  }

  /**
   * @param {Position} position
   */
  has(position) {
    if (this.wrap) {
      position = Position.wrap(
        position,
        { x: 0, y: 0 },
        { x: this.width, y: this.height }
      )
    }
    return (
      Position.isPosition(position) &&
      position.x >= 0 &&
      position.x < this.width &&
      position.y >= 0 &&
      position.y < this.height
    )
  }

  /**
   * @param {Position} position
   * @param {number} value
   */
  set(position, value) {
    if (this.has(position)) {
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

  /**
   * @param {Position} position
   * @param {Neighbourhood} neighbourhood a list of offsets to find the neighbours, default to a Moore neighbourhood
   */
  *neighbours(position, neighbourhood = MOORE) {
    yield* neighbourhood
      .map((offset) => {
        const p = { x: position.x + offset.x, y: position.y + offset.y }
        if (this.wrap) {
          p.x %= this.width
          p.y %= this.height
        }
        return p
      })
      .filter(this.has.bind(this))
  }

  /**
   * @param {any} position
   */
  *neighbourValues(position, neighbourhood = MOORE) {
    for (const n of this.neighbours(position, neighbourhood)) {
      yield this.get(n)
    }
  }

  toString(colSep = ',', rowSep = '\n', stringMap = '01') {
    if (!this.data) console.trace(this)
    return this.data.map((row) => row.join(colSep)).join(rowSep)
  }

  /**
   * @param {string} str
   */
  static fromString(
    str,
    stringMap = '0123456789',
    colSep = ',',
    rowSep = '\n'
  ) {
    return Grid2D.fromData(
      str
        .trim()
        .split(rowSep)
        .map((row) =>
          row
            .trim()
            .split(colSep)
            .map((char) => stringMap.indexOf(char))
        )
    )
  }

  /**
   * @param {number[][]} data
   */
  static fromData(data) {
    if (data.length && data.every((g) => g.length === data[0].length)) {
      return new Grid2D({
        data,
        width: data[0].length,
        height: data.length,
      })
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

  /**
   * @param {Grid2D} other
   */
  copyFrom(other) {
    if (other.width <= this.width && other.height <= this.height) {
      /**
       * @param {any} _
       * @param {Position} position
       */
      this.forEach((_, position) => this.set(position, other.get(position)))
    } else {
      throw Error('Bad copy target')
    }
  }

  /**
   * @param {(arg0: any, arg1: any, arg2: Grid2D) => number} fn
   */
  map(fn) {
    const grid = this.copy()
    /**
     * @param {any} value
     * @param {Position} position
     */
    grid.forEach((value, position) =>
      grid.set(position, fn(value, position, grid))
    )
    return grid
  }

  /**
   * @param {(position: Position, value: any, thisObj: Grid2D)} fn
   */
  forEach(fn) {
    for (const [value, position] of this) fn(position, value, this)
  }

  /**
   * @param {(previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any} fn
   * @param {any} init
   */
  reduce(fn, init) {
    return Array.from(this.values()).reduce(fn, init)
  }

  /**
   * @param {(arg0: any) => boolean} predicate
   */
  some(predicate) {
    for (const value of this.values()) {
      if (predicate(value)) {
        return true
      }
    }
    return false
  }

  /**
   * @param {(arg0: any) => boolean} predicate
   */
  every(predicate) {
    for (const value of this.values()) {
      if (!predicate(value)) {
        return false
      }
    }
    return true
  }
}

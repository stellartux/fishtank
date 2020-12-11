import { range, wrap } from './utils.js'

export class Position {
  constructor(...args) {
    if (args.length === 1) {
      if (Position.isPosition(args[0])) {
        this.x = args[0].x
        this.y = args[0].y
      } else if (Position.isPositionArray(args[0])) {
        this.x = args[0][0]
        this.y = args[0][1]
      }
    } else if (Position.isPositionArray(args)) {
      this.x = args[0]
      this.y = args[1]
    } else throw Error('Bad input')
  }

  /**
   * @param {Position} position
   */
  static isPosition(position) {
    return Number.isFinite(position.x) && Number.isFinite(position.y)
  }

  /**
   * @param {number[]} position
   */
  static isPositionArray(position) {
    return (
      Array.isArray(position) &&
      position.length === 2 &&
      Number.isFinite(position[0]) &&
      Number.isFinite(position[1])
    )
  }

  /**
   * Generates a range of Positions, from left to right, top to bottom.
   * @param {Position} start the top-left Position
   * @param {Position} end the bottom-right Position
   * @yields {Position}
   */
  static *range(start, end) {
    if (!Position.isPosition(start)) throw Error(`${start} is not a position`)
    if (!Position.isPosition(end)) throw Error(`${end} is not a position`)

    for (const y of range(start.y, end.y, start.y < end.y ? 1 : -1)) {
      for (const x of range(start.x, end.x, start.x < end.x ? 1 : -1)) {
        yield new Position(x, y)
      }
    }
  }

  /**
   * @param {Position} position
   * @param {Position} topLeft
   * @param {Position} bottomRight
   */
  static wrap(position, topLeft, bottomRight) {
    return new Position(
      wrap(position.x, topLeft.x, bottomRight.x),
      wrap(position.y, topLeft.y, bottomRight.y)
    )
  }

  toString() {
    return `{ x: ${this.x}, y: ${this.y} }`
  }
}

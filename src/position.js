import { range } from './utils.js'

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
    } else if (args.length === 2 && Position.isPositionArray(args)) {
      this.x = args[0]
      this.y = args[1]
    } else throw Error('Bad input')
  }
  static isPosition(p) {
    return Number.isFinite(p.x) && Number.isFinite(p.y)
  }
  static isPositionArray(p) {
    return Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1])
  }
  static *range(start, end) {
    if (!Position.isPosition(start)) throw Error('Start is not a position')
    if (!Position.isPosition(end)) throw Error('End is not a position')
    if (start.x > end.x || start.y > end.y)
      throw Error('Start at top-left, end at bottom-right')
    for (const y of range(start.y, end.y)) {
      for (const x of range(start.x, end.x)) {
        yield new Position(x, y)
      }
    }
  }
  toString() {
    return `{ x: ${this.x}, y: ${this.y} }`
  }
}

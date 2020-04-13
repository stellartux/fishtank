import { Grid2D } from './grid.js'

/**
 * @param {function} rules A function representing how the automaton changes
 * @param {number} columns
 * @param {number} rows
 * @param {function} [init=()=>0] A function returning the initial value based on position
 * @param {boolean} [wrap=false]
 * each tick, with the signature (value, position, previousGrid) => (newValue)
 **/
export class Automaton extends Grid2D {
  constructor(rules, ...options) {
    super(...options)
    this.rules = rules
  }
  tick() {
    const p = this.copy()
    p.forEach((v, i) => this.set(i, this.rules(v, i, p)))
  }
}

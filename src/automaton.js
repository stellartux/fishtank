import { Grid2D } from './grid.js'

/**
 * @param {Ruleset} rules (position, grid) => newValue
 * @param {object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {function} [options.init=()=>0] A function returning the initial value based on position
 * @param {boolean} [options.wrap=false]
 **/
export class Automaton extends Grid2D {
  constructor(rules, options) {
    super(options)
    this.rules = rules
    if (options.historyLength > 0) {
      if (options.historyLength === Infinity) {
        this.history = []
      } else {
        const state = []
        this.history = {
          push: function(grid) {
            state.push(grid)
            while (state.length > options.historyLength) {
              state.shift()
            }
          },
          pop: function() {
            return state.pop()
          },
          get length() {
            return state.length
          }
        }
      }
    } else {
      this.history = { push: () => {} }
    }
  }

  next() {
    const previous = this.copy()
    previous.forEach((_, pos) => this.set(pos, this.rules(pos, previous)))
    this.history.push(previous)
  }

  undo(steps = 1) {
    if (this.history.length >= steps) {
      while (steps-- > 1) {
        this.history.pop()
      }
      const state = this.history.pop()
      this.copyFrom(state)
    }
  }
}

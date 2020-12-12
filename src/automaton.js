import { Grid2D } from './grid.js'

export class Automaton extends Grid2D {
  /**
   * @param {import('./rules.js').Ruleset} rules (position, grid) => newValue
   * @param {number} options.height
   * @param {number} options.width
   * @param {function} [options.init = () => 0] A function returning the initial value based on position
   * @param {boolean} [options.wrap = false]
   * @param {number} [option.historyLength = 0] How many undo states to retain
   **/
  constructor(rules, options) {
    super(options)
    this.rules = rules
    if (options.historyLength > 0) {
      if (options.historyLength === Infinity) {
        this.history = []
      } else {
        const state = []
        this.history = {
          push: function (grid) {
            state.push(grid)
            while (state.length > options.historyLength) {
              state.shift()
            }
          },
          pop: function () {
            return state.pop()
          },
          peek: function() {
            return state[state.length - 1]
          },
          get length() {
            return state.length
          },
        }
      }
    } else {
      this.history = { push: () => {} }
    }
  }

  next(rules = this.rules) {
    const previous = this.copy()
    previous.forEach((_, pos) => this.set(pos, rules(pos, previous)))
    this.history.push(previous)
    return this
  }

  /**
   * ! May enter an infinite loop if the automaton does not terminate
   */
  terminate() {
    if (this.history.length) {
      do {
        this.next()
      } while (!this.equals(this.history.peek()))
    }
  }

  undo(steps = 1) {
    if (this.history.length >= steps) {
      while (steps-- > 1) {
        this.history.pop()
      }
      this.copyFrom(this.history.pop())
    }
    return this
  }
}

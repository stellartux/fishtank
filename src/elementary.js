import { isByte, withinRange } from './utils.js'

/**
 * When given a Wolfram number, an initial state and a word length for the state,
 * returns an iterable which generates the successive values of the Elementary
 * Cellular Automaton described by that Wolfram number.
 **/
export class ElementaryAutomaton {
  /**
   * @param {number} wolframNumber
   * @param {number} [initialState = 1] default 1
   * @param {number} [length = 16] default 16
   */
  constructor(wolframNumber, initialState = 1, length = 16) {
    if (
      !(
        isByte(wolframNumber) &&
        withinRange(length, 2, 32, 1) &&
        withinRange(initialState, 0, 2 ** length - 1, 1)
      )
    ) {
      throw Error(`Bad constructor params: {
  wolframNumber: ${wolframNumber},
  initialState: ${initialState},
  length: ${length},
}`)
    }
    this.patterns = Number(wolframNumber)
      .toString(2)
      .padStart(8, '0')
      .split('')
      .reverse()
      .map(Number)
    this.state = initialState
    this.length = length
  }

  applyRule(left, centre, right) {
    return this.patterns[4 * left + 2 * centre + right]
  }

  get [Symbol.iterator]() {
    return this
  }

  next() {
    let state = 0
    for (const values of this.triplets()) {
      state <<= 1
      state |= this.patterns[parseInt(values.join(''), 2)]
    }
    this.state = state
    return { done: false, value: state }
  }

  /**
   * A generator which returns an array of Numbers [left, centre, right]
   * for each bit of the automaton's current state.
   **/
  *triplets() {
    const digits = this.state
      .toString(2)
      .padStart(this.length, '0')
      .split('')
      .map(Number)
    yield [0].concat(digits.slice(0, 2))
    for (let i = 0; i < digits.length - 2; i++) {
      yield digits.slice(i, i + 3)
    }
    yield digits.slice(-2).concat(0)
  }
}

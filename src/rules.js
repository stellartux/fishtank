import { Grid2D } from './grid.js'
import { HEXAGONAL, MOORE, VON_NEUMANN } from './neighbourhood.js'
import { sum, unique } from './utils.js'
/** @typedef {import('./position.js').Position} Position */

/**
 * @param {Position} position
 * @param {Grid2D} grid
 */
export function gameOfLifeRules(position, grid) {
  const value = grid.get(position)
  let total = 0
  for (const v of grid.neighbourValues(position)) {
    total += v
  }
  if (total === 3) return 1
  else if (total === 2) return value
  else return 0
}

export const totalRuleRegex = /^B(0?1?2?3?4?5?6?7?8?)[\/_]S(0?1?2?3?4?5?6?7?8?)([HV]?)$/

const neighbourhoods = {
  '': MOORE,
  V: VON_NEUMANN,
  H: HEXAGONAL,
}

export const games = {
  Life: 'B3/S23',
  HighLife: 'B36/S23',
  'Day & Night': 'B3678/S34678',
  Diamoeba: 'B35678/S5678',
  Seeds: 'B2/S',
  'Serviettes or Persian Rug': 'B234/S',
  LongLife: 'B345/S5',
  Replicator: 'B1357/S1357',
  'B25/S4': 'B25/S4',
  'Life without Death': 'B3/S012345678',
  '34Life': 'B34/S34',
  '2x2': 'B36/S125',
  Morley: 'B368/S245',
  Anneal: 'B4678/S35678',
}

/**
 * Ruleset generates a function that when given a position and a grid, returns
 * the value of that position of the grid on the next iteration.
 *
 * @param {string} str
 * @returns {function} (position, grid) => newValue
 **/
export function Ruleset(str) {
  if (str in games) {
    str = games[str]
  }
  if (totalRuleRegex.test(str)) {
    const match = str.match(totalRuleRegex)
    const birth = match[1].split('').filter(unique).map(Number)
    const survives = match[2].split('').map(Number)
    const neighbourhood = neighbourhoods[match[3]]

    /**
     * @param {Position} position
     * @param {Grid2D} grid
     */
    function ruleset(position, grid) {
      return Number(
        (grid.get(position) ? survives : birth).includes(
          Array.from(grid.neighbourValues(position, neighbourhood)).reduce(sum)
        )
      )
    }
    return ruleset
  } else {
    throw Error(`Ruleset: Could not parse "${str}"`)
  }
}

// B13/S012V or B2/S013V.

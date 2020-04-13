export function gameOfLifeRules(value, position, grid) {
  let total = 0
  for (const v of grid.neighbourValues(position)) {
    total += v
  }
  if (total === 3) return 1
  else if (total === 2) return value
  else return 0
}

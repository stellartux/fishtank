export const VON_NEUMANN = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: 0, y: 1 },
]

export const EXPANDED_VON_NEUMANN = VON_NEUMANN.map(p => ({
  x: p.x * 2,
  y: p.y * 2,
})).concat(VON_NEUMANN)

export const MOORE = []
for (let y = -1; y <= 1; y++)
  for (let x = -1; x <= 1; x++) if (x || y) MOORE.push({ x, y })

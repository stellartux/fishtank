import { assertEquals } from '../devdeps.ts'
import { MOORE } from '../src/neighbourhood.js'

const legacy = {
  VON_NEUMANN: [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 },
  ],
  EXPANDED_VON_NEUMANN: [],
  MOORE: [],
}
for (let y = -1; y <= 1; y++)
  for (let x = -1; x <= 1; x++) if (x || y) legacy.MOORE.push({ x, y })
legacy.VON_NEUMANN.map(p => {
  legacy.EXPANDED_VON_NEUMANN.push(p)
  legacy.EXPANDED_VON_NEUMANN.push({
    x: p.x * 2,
    y: p.y * 2,
  })
})

Deno.test({
  name: 'Moore neighbourhood',
  fn: function() {
    assertEquals(MOORE, legacy.MOORE)
  },
})

if (import.meta.main) Deno.runTests()

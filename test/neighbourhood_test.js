import { assertEquals } from '../devdeps.ts'
import { MOORE, VON_NEUMANN, Neighbourhood } from '../src/neighbourhood.js'

const legacy = {
  VON_NEUMANN: [
    { x: 0, y: -1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ],
  MOORE: [],
}
for (let y = -1; y <= 1; y++)
  for (let x = -1; x <= 1; x++) if (x || y) legacy.MOORE.push({ x, y })

Deno.test({
  name: 'Moore neighbourhood',
  fn: function() {
    assertEquals(MOORE, legacy.MOORE)
    assertEquals(new Neighbourhood('01235678'), legacy.MOORE)
  },
})
Deno.test({
  name: 'Von Neumann neighbourhood',
  fn: function() {
    assertEquals(VON_NEUMANN, legacy.VON_NEUMANN)
    assertEquals(new Neighbourhood('1357'), legacy.VON_NEUMANN)
  },
})

if (import.meta.main) Deno.runTests()

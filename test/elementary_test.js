import { assertEquals } from '../devdeps.ts'
import { ElementaryAutomaton } from '../src/elementary.js'

Deno.test({
  name: 'ElementaryAutomaton.triplets()',
  fn: function() {
    const elem = new ElementaryAutomaton(0, 7, 3)
    assertEquals(Array.from(elem.triplets()), [
      [0, 1, 1],
      [1, 1, 1],
      [1, 1, 0],
    ])
  },
})

Deno.test({
  name: 'ElementaryAutomaton(22)',
  fn: function() {
    const elem = new ElementaryAutomaton(22, 0x80, 16)
    for (const val of [0x1c0, 0x220, 0x770, 0x808, 0x1c1c, 0x2222, 0x7777]) {
      assertEquals(elem.next().value, val)
    }
  },
})

if (import.meta.main) Deno.runTests()

import { assert, assertEquals } from '../devdeps.ts'
import { Ruleset, gameOfLifeRules, games } from '../src/rules.js'
import { Automaton } from '../src/automaton.js'
import { Position } from '../src/position.js'
import { HEXAGONAL } from '../src/neighbourhood.js'

const expected = new Automaton(gameOfLifeRules, { width: 4, height: 4 })
const actual = new Automaton(new Ruleset(games.Life), { width: 4, height: 4 })

expected.set({ x: 1, y: 1 }, 1)
expected.set({ x: 2, y: 2 }, 1)
expected.set({ x: 3, y: 3 }, 1)
actual.set({ x: 1, y: 1 }, 1)
actual.set({ x: 2, y: 2 }, 1)
actual.set({ x: 3, y: 3 }, 1)

Deno.test({
  name: 'Ruleset: Life',
  fn: function() {
    assertEquals(expected.toString(), actual.toString())
    expected.tick()
    actual.tick()
    assertEquals(expected.toString(), actual.toString())
  },
})
Deno.test({
  name: 'Ruleset: HighLife',
  fn: function() {
    const highlife = new Automaton(new Ruleset(games.HighLife), {
      width: 5,
      height: 5,
    })
    for (const position of highlife.neighbours({ x: 2, y: 2 }, HEXAGONAL)) {
      highlife.set(position, 1)
    }
    highlife.tick()
    assertEquals(highlife.get({ x: 2, y: 2 }), 1)
  },
})

if (import.meta.main) Deno.runTests()

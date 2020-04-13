import { assertEquals } from '../devdeps.ts'
import { Automaton } from '../src/automaton.js'
import { gameOfLifeRules } from '../src/rules.js'

const gol = new Automaton(gameOfLifeRules, 5, 5)

Deno.test({
  name: 'Initial State',
  fn: function() {
    assertEquals(
      gol.toString(),
      `0,0,0,0,0
0,0,0,0,0
0,0,0,0,0
0,0,0,0,0
0,0,0,0,0`
    )
  },
})
Deno.test({
  name: 'Set state',
  fn: function() {
    gol.set({ x: 1, y: 1 }, 1)
    gol.set({ x: 2, y: 1 }, 1)
    gol.set({ x: 3, y: 1 }, 1)
    assertEquals(
      gol.toString(),
      `0,0,0,0,0
0,1,1,1,0
0,0,0,0,0
0,0,0,0,0
0,0,0,0,0`
    )
  },
})
Deno.test({
  name: 'Tick',
  fn: function() {
    gol.tick()
    assertEquals(
      gol.toString(),
      `0,0,1,0,0
0,0,1,0,0
0,0,1,0,0
0,0,0,0,0
0,0,0,0,0`
    )
  },
})

if (import.meta.main) Deno.runTests()

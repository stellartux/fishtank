import { assertEquals } from '../devdeps.ts'
import { Automaton } from '../src/automaton.js'
import { gameOfLifeRules } from '../src/rules.js'

const gol = new Automaton(gameOfLifeRules, {
  width: 5,
  height: 5,
  historyLength: 5,
})

Deno.test({
  name: 'new Automaton()',
  fn: function() {
    assertEquals(
      `0,0,0,0,0
0,0,0,0,0
0,0,0,0,0
0,0,0,0,0
0,0,0,0,0`,
      gol.toString()
    )
  },
})
Deno.test({
  name: 'automaton.set()',
  fn: function() {
    gol.set({ x: 1, y: 1 }, 1)
    gol.set({ x: 2, y: 1 }, 1)
    gol.set({ x: 3, y: 1 }, 1)
    assertEquals(
      `0,0,0,0,0
0,1,1,1,0
0,0,0,0,0
0,0,0,0,0
0,0,0,0,0`,
      gol.toString()
    )
  },
})
Deno.test({
  name: 'automaton.next()',
  fn: function() {
    gol.next()
    assertEquals(
      `0,0,1,0,0
0,0,1,0,0
0,0,1,0,0
0,0,0,0,0
0,0,0,0,0`,
      gol.toString()
    )
  },
})
Deno.test({
  name: 'automaton.undo()',
  fn: function() {
    gol.undo()
    assertEquals(
      `0,0,0,0,0
0,1,1,1,0
0,0,0,0,0
0,0,0,0,0
0,0,0,0,0`,
      gol.toString()
    )
  },
})

if (import.meta.main) Deno.runTests()

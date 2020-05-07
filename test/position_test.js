import { assertEquals } from '../devdeps.ts'
import { Position } from '../src/position.js'

Deno.test({
  name: 'new Position()',
  fn: function() {
    let p = new Position(1, 2)
    assertEquals(p.x, 1)
    assertEquals(p.y, 2)
    p = new Position([3, 4])
    assertEquals(p.x, 3)
    assertEquals(p.y, 4)
    p = new Position({ x: 5, y: 6 })
    assertEquals(p.x, 5)
    assertEquals(p.y, 6)
    p = new Position(new Position(7, 8))
    assertEquals(p.x, 7)
    assertEquals(p.y, 8)
  },
})
Deno.test({
  name: 'Position.range()',
  fn: function() {
    assertEquals(Array.from(Position.range({ x: 0, y: 0 }, { x: 1, y: 1 })), [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ])
  },
})
Deno.test({
  name: 'Position.toString()',
  fn: function() {
    assertEquals(new Position(1, 2).toString(), '{ x: 1, y: 2 }')
  },
})
Deno.test({
  name: 'Position.wrap()',
  fn: function() {
    assertEquals(
      Position.wrap({ x: 4, y: 2 }, { x: 0, y: 0 }, { x: 3, y: 3 }),
      new Position(1, 2)
    )
  },
})

if (import.meta.main) Deno.runTests()

import { assertEquals } from '../devdeps.ts'
import { Grid2D } from '../src/grid.js'
import { sum, prod } from '../src/utils.js'

const g = new Grid2D({ width: 4, height: 4 })
const empty = '0,0,0,0\n0,0,0,0\n0,0,0,0\n0,0,0,0'
const diagonal = '1,0,0,0\n0,2,0,0\n0,0,3,0\n0,0,0,4'

Deno.test({
  name: 'Grid2D.toString()',
  fn: function() {
    assertEquals(g.toString(), empty)
  },
})
Deno.test({
  name: 'Grid2D.set()',
  fn: function() {
    g.set({ x: 0, y: 0 }, 1)
    g.set({ x: 1, y: 1 }, 2)
    g.set({ x: 2, y: 2 }, 3)
    g.set({ x: 3, y: 3 }, 4)
    assertEquals(g.toString(), diagonal)
  },
})
Deno.test({
  name: 'Grid2D.copy()',
  fn: function() {
    const h = g.copy()
    h.set({ x: 1, y: 0 }, 5)
    assertEquals(g.toString(), diagonal)
    assertEquals(h.toString(), '1,5,0,0\n0,2,0,0\n0,0,3,0\n0,0,0,4')
  },
})
Deno.test({
  name: 'Grid2D.forEach()',
  fn: function() {
    g.forEach((v, i, a) => a.set(i, v * 2))
    assertEquals(g.toString(), '2,0,0,0\n0,4,0,0\n0,0,6,0\n0,0,0,8')
  },
})
Deno.test({
  name: 'Grid2D.map()',
  fn: function() {
    assertEquals(
      g.map(x => 2 * x).toString(),
      '4,0,0,0\n0,8,0,0\n0,0,12,0\n0,0,0,16'
    )
  },
})
Deno.test({
  name: 'Grid2D.reduce()',
  fn: function() {
    assertEquals(g.reduce(sum), 20)
    assertEquals(g.map(x => x || 1).reduce(prod), 384)
  },
})
Deno.test({
  name: 'Grid2D.neighbourValues()',
  fn: function() {
    assertEquals(
      Array.from(
        new Grid2D({ width: 3, height: 3, init: () => 1 }).neighbourValues({
          x: 1,
          y: 1,
        })
      ),
      Array.from({ length: 8 }, () => 1)
    )
    let i = 0
    assertEquals(
      Array.from(
        new Grid2D({ width: 3, height: 3, init: () => i++ }).neighbourValues({
          x: 1,
          y: 1,
        })
      ),
      [0, 1, 2, 3, 5, 6, 7, 8]
    )
  },
})
Deno.test({
  name: 'Grid2D.fromString()',
  fn: function() {
    assertEquals(Grid2D.fromString(empty).toString(), empty)
    assertEquals(Grid2D.fromString(diagonal).toString(), diagonal)
  },
})

if (import.meta.main) Deno.runTests()

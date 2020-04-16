import { assertEquals } from '../devdeps.ts'
import * as Utils from '../src/utils.js'

Deno.test({
  name: 'clamp',
  fn: function() {
    assertEquals(Utils.clamp(-1.5, -1, 1), -1)
    assertEquals(Utils.clamp(0.5, -1, 1), 0.5)
    assertEquals(Utils.clamp(1.5, -1, 1), 1)
    assertEquals(Utils.clamp(3, 4, 6), 4)
    assertEquals(Utils.clamp(-27.86, -30, 30), -27.86)
    assertEquals(Utils.clamp(-39.3213, -25, -20), -25)
  },
})
Deno.test({
  name: 'sum',
  fn: function() {
    assertEquals([1, 2, 3, 4].reduce(Utils.sum), 10)
    assertEquals([5, 6, 7, 8, 9].reduce(Utils.sum), 35)
  },
})
Deno.test({
  name: 'prod',
  fn: function() {
    assertEquals([1, 2, 3, 4].reduce(Utils.prod), 24)
    assertEquals([5, 6, 7, 8, 9].reduce(Utils.prod), 15120)
  },
})
Deno.test({
  name: 'range',
  fn: function() {
    assertEquals(Array.from(Utils.range(-1, 1)), [-1, 0, 1])
    assertEquals(Array.from(Utils.range(1, 7, 2)), [1, 3, 5, 7])
  },
})

if (import.meta.main) Deno.runTests()

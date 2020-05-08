export const $ = (selector, parent = document) =>
    parent.querySelector(selector),
  $$ = (sel, par = document) => Array.from(par.querySelectorAll(sel)),
  sum = (a = 0, b = 0) => Number(a) + Number(b),
  prod = (a = 1, b = 1) => a * b,
  clamp = (val, min, max) => Math.max(min, Math.min(max, val)),
  wrap = (val, min, max) => ((val + max) % (max - min)) + min,
  range = function*(a, b, step = 1) {
    step = Math.abs(step)
    if (a < b) {
      for (let i = a; i <= b; i += step) yield i
    } else if (a > b) {
      for (let i = a; i >= b; i -= step) yield i
    }
  },
  withinRange = (val, min, max, step = 0) =>
    val >= min && val <= max && (!step || Number.isInteger((val - min) / step)),
  unique = (val, ind, arr) => ind === arr.indexOf(val),
  isByte = val => withinRange(val, 0, 255, 1),
  digits = function*(n, base = 10) {
    yield* n.toString(base)
  },
  zip = (ks, vs) => ks.map((k, i) => [k, vs[i]]),
  unzip = r => [r.map(p => p[0]), r.map(p => p[1])]
let debounceRef
export function debounce(fn, time = 100) {
  if (debounceRef) clearTimeout(debounceRef)
  debounceRef = setTimeout(fn, time)
}

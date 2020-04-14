export const $ = (selector, parent = document) =>
    parent.querySelector(selector),
  $$ = (sel, par = document) => Array.from(par.querySelectorAll(sel)),
  sum = (a = 0, b = 0) => a + b,
  prod = (a = 1, b = 1) => a * b,
  clamp = (val, min, max) => Math.max(min, Math.min(max, val)),
  wrap = (val, min, max) => (val % (max - min)) + min,
  range = function*(min, max, step = 1) {
    for (let i = min; i < max; i += step) yield i
  }
let debounceRef
export function debounce(fn, time = 100) {
  if (debounceRef) clearTimeout(debounceRef)
  debounceRef = setTimeout(fn, time)
}

export const $ = (selector, parent = document) => parent.querySelector(selector)
export const $$ = (sel, par = document) => Array.from(par.querySelectorAll(sel))
export const sum = (a = 0, b = 0) => a + b
export const prod = (a = 1, b = 1) => a * b
export const clamp = (val, min, max) => Math.max(min, Math.min(max, val))
export const wrap = (val, min, max) => val % (max - min) + min
export const range = function*(min, max, step = 1) {
  for (let i = min; i < max; i += step) yield i
}
let debounceRef
export function debounce(fn, time = 100) {
  if (debounceRef) clearTimeout(debounceRef)
  debounceRef = setTimeout(fn, time)
}

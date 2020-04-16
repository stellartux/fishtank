import { range } from './utils.js'
import { Position } from './position.js'

export const FULL = Array.from(Position.range({ x: -1, y: -1 }, { x: 1, y: 1 }))

export function Neighbourhood(descriptor) {
  if (!/^[0-8]+$/.test(descriptor)) {
    throw Error(`Neighbourhood(): Could not parse ${descriptor}`)
  }
  return descriptor.split('').map(c => FULL[c])
}

export const MOORE = new Neighbourhood('01235678')
export const VON_NEUMANN = new Neighbourhood('1357')

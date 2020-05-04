import { Automaton } from './automaton.js'
import { $, $$, wrap } from './utils.js'

const canvas = $('canvas'),
  ctx = canvas.getContext('2d'),
  pixel = 16 * devicePixelRatio,
  controls = $('#controls'),
  loopTime = 250
let width, height, automaton, colors

function wireWorldRules(position, grid) {
  let value = grid.get(position)
  if (value === 3) {
    let headCount = 0
    for (const neighbourValue of grid.neighbourValues(position)) {
      if (neighbourValue === 1) headCount++
    }
    value = headCount === 1 || headCount === 2 ? 1 : 3
  } else if (value === 2 || value === 1) {
    value++
  } else if (value !== 0) {
    throw Error(`Got value of ${value}`)
  }
  drawCell(position, value)
  return value
}

function onResize() {
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
  width = Math.floor(canvas.width / pixel)
  height = Math.floor(canvas.height / pixel)
  automaton = new Automaton(wireWorldRules, {
    width,
    height,
    historyLength: 1,
  })
}
onResize()
window.addEventListener('resize', onResize)

function toggleCell(ev) {
  ev.preventDefault()
  const position = {
    x: Math.floor((ev.clientX - ev.srcElement.offsetLeft) / pixel),
    y: Math.floor((ev.clientY - ev.srcElement.offsetTop) / pixel),
  }
  let value = automaton.get(position)
  if (ev.button === 2) {
    value++
  } else {
    value--
  }
  value = wrap(value, 0, 4)
  automaton.set(position, value)
  drawCell(position, value)
}
canvas.addEventListener('pointerdown', toggleCell)
canvas.addEventListener('contextmenu', ev => {
  ev.preventDefault()
})

ctx.strokeStyle = 'grey'
function drawCell(position, value) {
  ctx.fillStyle = colors[value]
  ctx.fillRect(position.x * pixel, position.y * pixel, pixel, pixel)
  ctx.strokeRect(position.x * pixel, position.y * pixel, pixel, pixel)
}
function drawGrid() {
  for (const cell of automaton) {
    drawCell(...cell)
  }
}

let scheduledCallback
const buttonCallbacks = {
  clear: () => {
    automaton.clear()
    drawGrid()
  },
  step: () => {
    buttonCallbacks.stop()
    automaton.next()
  },
  play: () => {
    if (automaton.some(value => value === 1)) {
      buttonCallbacks.loop()
    }
  },
  loop: () => {
    automaton.next()
    if (automaton.some(value => value === 1 || value === 2)) {
      scheduledCallback = setTimeout(buttonCallbacks.loop, loopTime)
    }
  },
  stop: () => {
    if (scheduledCallback) {
      clearTimeout(scheduledCallback)
      scheduledCallback = undefined
    }
  },
  ground: () => {
    buttonCallbacks.stop()
    automaton.next((position, grid) => {
      const value = grid.get(position) === 0 ? 0 : 3
      if (value) drawCell(position, value)
      return value
    })
  },
  plane: () => {
    buttonCallbacks.stop()
    automaton.fill(3)
    drawGrid()
  }
}
$$('button', controls).forEach(button => {
  button.addEventListener('click', buttonCallbacks[button.name])
})
function colorCallback() {
  colors = $$('input[type="color"]', controls).map(el => el.value)
  drawGrid()
}
$$('input[type="color"]', controls).forEach(input => {
  input.addEventListener('change', colorCallback)
})
colorCallback()

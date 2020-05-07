import { Automaton } from './automaton.js'
import { Grid2D } from './grid.js'
import { AbstractLaunchpad as Launchpad } from './launchpad.js'
import { Position } from './position.js'
import { gameOfLifeRules } from './rules.js'
import { $, $$, range, unzip, zip } from './utils.js'

async function setupMIDI() {
  const access = await navigator.requestMIDIAccess({ sysex: true })
  const launchpad = new Launchpad(access)
  $('#setup-midi').remove()

  const automaton = new Automaton(
    (position, grid) => {
      const value = gameOfLifeRules(position, grid)
      launchpad.lightPad(position, value)
      return value
    },
    {
      width: 8,
      height: 8,
      data: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
    }
  )
  for (const data of automaton.entries()) {
    launchpad.lightPad(...data)
  }

  let scheduledCallback
  const buttonCallbacks = {
    clear: () => {
      automaton.clear()
      launchpad.clearPads()
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
      const previous = automaton.toString()
      automaton.next()
      const current = automaton.toString()
      if (previous !== current) {
        scheduledCallback = setTimeout(buttonCallbacks.loop, 250)
      }
    },
    stop: () => {
      if (scheduledCallback) {
        clearTimeout(scheduledCallback)
        scheduledCallback = undefined
      }
    },
    random: () => {
      automaton.next(() => Math.round(Math.random()))
      refreshPads()
    },
  }
  $$('#controls button').forEach(button => {
    button.addEventListener('click', buttonCallbacks[button.name])
  })

  launchpad.input.addEventListener('midimessage', ({ data }) => {
    if (data[2]) {
      switch (data[1]) {
        case 104:
          buttonCallbacks.step()
          break
        case 105:
          buttonCallbacks.play()
          break
        case 106:
          buttonCallbacks.stop()
          break
        case 107:
          buttonCallbacks.clear()
          break
        default:
          const position = launchpad.positions.get(data[1])
          const value = Number(!automaton.get(position))
          automaton.set(position, value)
          launchpad.lightPad(position, value)
      }
    }
  })
}

$('button[name="connect"]').addEventListener('click', setupMIDI)

navigator.permissions
  .query({ name: 'midi' })
  .then(permission => {
    if (permission.state === 'granted') setupMIDI()
  })
  .catch(error => {
    console.warn(error)
  })

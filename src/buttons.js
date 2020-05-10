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
      launchpad.lightPad(position, value ? 'yellow' : 'off')
      return value
    },
    {
      width: 8,
      height: 8,
      data: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      wrap: true,
    }
  )

  launchpad.onPush = (position, value) => {
    automaton.set(position, value > 0 ? 1 : 0)
    launchpad.lightPad(position, value ? 'yellow' : 'off')
  }

  function refreshPads() {
    for (const pad of automaton.entries()) {
      launchpad.lightPad(pad[0], pad[1] ? 'yellow' : 'off')
    }
  }

  refreshPads()

  function playLoop() {
    const previous = automaton.toString()
    automaton.next()
    const current = automaton.toString()
    if (previous !== current) {
      scheduledCallback = setTimeout(playLoop, 250)
    }
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
      buttonCallbacks.stop()
      playLoop()
    },
    stop: () => {
      if (scheduledCallback) {
        clearTimeout(scheduledCallback)
        scheduledCallback = undefined
      }
    },
    random: () => {
      automaton.next(() => Math.round(Math.random()))
      buttonCallbacks.play()
    },
  }

  const controls = $('#controls')
  $$('button', controls).forEach(button => {
    button.addEventListener('click', buttonCallbacks[button.name])
  })
  $('input[type="checkbox"][name="wrap"]').addEventListener('change', event => {
    automaton.wrap = event.target.checked
  })

  launchpad.input.addEventListener('midimessage', ({ data }) => {
    if (data[2]) {
      if (data[1] >= 104) {
        buttonCallbacks[controls.children[data[1] - 104].name]()
      } else {
        const position = launchpad.positions.get(data[1])
        const value = Number(!automaton.get(position))
        automaton.set(position, value)
        launchpad.lightPad(position, value ? 'yellow' : 'off')
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

import { $ } from './utils.js'
import { Automaton } from './automaton.js'
import { Ruleset } from './rules.js'

async function setupMIDI() {
  const access = await navigator.requestMIDIAccess({ sysex: true })
  const launchpad = Array.from(access.inputs).find(input =>
    input[1].name.startsWith('Launchpad')
  )
  if (launchpad) {
    $('#setup-midi').remove()
    const input = launchpad[1]
    const output = Array.from(access.outputs).find(
      output => output[1].name === input.name
    )[1]
    input.addEventListener('midimessage', ev => {
      $('#controls').innerText = ev.data.toString()
    })
  }
}

$('button[name="connect"]').addEventListener('click', setupMIDI)

navigator.permissions
  .query({ name: 'midi' })
  .then(permission => {
    if (permission.state === 'granted') setupMIDI()
  })
  .catch(() => {})

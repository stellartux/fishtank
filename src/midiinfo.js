//@ts-nocheck
;(async () => {
  const permission = await navigator.permissions.query({ name: 'midi' })

  if (permission.state === 'granted') {
    const midi = await navigator.requestMIDIAccess({ sysex: true })
  let str = Array.from(midi.outputs).forEach(input => {
      console.dir(input[1])
    })
    window.midi = midi

  }
})()

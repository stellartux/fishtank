import { range, zip } from './utils.js'
import { Grid2D } from './grid.js'
import { Position } from './position.js'

export class AbstractLaunchpad {
  constructor(access) {
    if (!AbstractLaunchpad.available(access)) {
      throw Error('Launchpad not found in MIDIAccess object.')
    }

    this.input = Array.from(access.inputs).find(input =>
      input[1].name.startsWith('Launchpad')
    )[1]
    if (typeof inputCallback === 'function') {
      this.input.addEventListener('midimessage', inputCallback)
    }

    this.output = Array.from(access.outputs).find(output =>
      output[1].name.startsWith('Launchpad')
    )[1]

    const midiNumbers = Grid2D.fromData(
      [...range(11, 81, 10)].map(start => [...range(start, start + 7)])
    )
    this.midiNumbers = midiNumbers

    this.positions = {
      get: function(midiNumber) {
        const position = new Position(
          (midiNumber % 10) - 1,
          Math.floor(midiNumber / 10) - 1
        )
        if (midiNumbers.has(position)) {
          return position
        }
      },
      keys: function*() {
        yield* midiNumbers.values()
      },
      values: function*() {
        yield* midiNumbers.keys()
      },
      entries: function*() {
        for (const [key, value] of midiNumbers.entries()) {
          yield [value, key]
        }
      },
    }

    this.clearPads()
  }

  lightPad(position, color = 62) {
    if (this.midiNumbers.has(position)) {
      this.output.send([144, this.midiNumbers.get(position), color])
    }
  }

  lightAllPads(color = 62) {
    for (const value of this.midiNumbers.values()) {
      this.output.send([144, value, color])
    }
  }

  clearPads() {
    this.lightAllPads(0)
  }

  lightColumn(column, color = 62) {
    for (const position of Position.range(
      { x: column, y: 0 },
      { x: column, y: 7 }
    )) {
      this.lightPad(position, color)
    }
  }

  lightRow(row, color = 62) {
    for (const position of Position.range({ x: 0, y: row }, { x: 7, y: row })) {
      this.lightPad(position, color)
    }
  }

  /**
   * @param {MIDIAccess} access
   * @returns {boolean} whether access has a Launchpad
   **/
  static available(access) {
    const hasLaunchpad = device => device[1].name.startsWith('Launchpad')
    return (
      Array.from(access.inputs).some(hasLaunchpad) &&
      Array.from(access.outputs).some(hasLaunchpad)
    )
  }

  static get palette() {
    return [12, 15, 62, 60]
  }
}

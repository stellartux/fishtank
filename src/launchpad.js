import { range, zip, $ } from './utils.js'
import { Grid2D } from './grid.js'
import { Position } from './position.js'

export class AbstractLaunchpad {
  constructor(access, inputCallback) {
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

    this.palette = this.hasRGB
      ? {
          off: 12,
          blue: 44,
          yellow: 63,
          orange: 47,
          green: 61,
          red: 14,
        }
      : {
          off: 0,
          blue: 37,
          yellow: 62,
          orange: 61,
          green: 22,
          red: 5,
        }

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

    let parent = $('#launchpad-grid')
    if (!parent) {
      parent = document.createElement('div')
      parent.id = 'launchpad-grid'
      document.body.append(parent)
    }
    this.element = parent

    for (const position of Position.range({ x: 0, y: 7 }, { x: 7, y: 0 })) {
      const el = document.createElement('button')
      el.classList.add('square-pad')
      el.position = position
      el.addEventListener('click', () => {
        const value = el.classList.contains('lit') ? 0 : 62
        this.lightPad(position, value)
        this.onPush(position, value)
      })
      parent.append(el)
    }

    this.clearPads()
  }

  get hasRGB() {
    return /^Launchpad ?(S|Mini( MK2)?)?$/.test(this.input.name)
  }

  /** @virtual **/
  onPush(position, value) {}

  lightPad(position, color) {
    if (this.midiNumbers.has(position)) {
      this.output &&
        this.output.send([
          144,
          this.midiNumbers.get(position),
          this.palette[color],
        ])
      this.element.children[(7 - position.y) * 8 + position.x].classList.toggle(
        'lit',
        color !== 'off'
      )
    }
  }

  lightAllPads(color) {
    for (const value of this.midiNumbers.values()) {
      this.output &&
        this.output.send([144, value, this.palette[color]])
    }
    for (const pad of this.element.children) {
      pad.classList.toggle('lit', color !== 0)
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
}

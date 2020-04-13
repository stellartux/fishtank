import { Automaton } from './automaton.js'
import { $, $$, debounce } from './utils.js'
import { gameOfLifeRules } from './rules.js'

customElements.define(
  'game-of-life',
  class GameOfLife extends HTMLElement {
    constructor() {
      super()
      this.init = this.hasAttribute('init')
        ? Function('{x, y}', `return ${this.getAttribute('init')}`)
        : () => 0
      this.wrap = Boolean(this.getAttribute('wrap'))
      this.paused = true
      this.rows = this.getAttribute('rows') || this.getAttribute('columns') || 8
      this.columns = this.getAttribute('columns') || this.rows
      this.rules = gameOfLifeRules
      this.shadow = this.attachShadow({ mode: 'open' })
      this.shadow.innerHTML = `
<nav>
<button name="next">Next</button>
<button name="pause">Unpause</button>
<button name="play">Play</button>
<button name="stop">Stop</button>
<button name="clear">Clear</button>
<button name="randomise">Randomise</button>
<input name="speed" type="range" min="1" max="50" step="any" value="20" />
<input name="rows" type="range" min="3" max="32" value="${this.rows}" />
<input name="columns" type="range" min="3" max="64" value="${this.columns}" />
</nav>
<main>
</main>
<style>
*{
  border-radius:0.3em;
  --gap:0.1rem;
  --height: calc(90vmin / var(--rows));
}
main{
  margin:auto;
  display:grid;
  gap: var(--gap);
  justify-items: center;
  align-items: center;
  grid-template-rows: repeat(var(--rows), 1fr);
  grid-template-columns: repeat(var(--columns), 1fr);
  width: max-content;
}
nav{
  position:absolute;
  background-color: var(--bg-color);
  margin:auto;
  padding:0.5rem;
  display:flex;
  flex-direction:column;
  justify-content:center;
  border:medium outset var(--off-color);
  opacity: 0.8;
}
label{
  cursor: pointer;
}
main label input[type="checkbox"]{display:none;}
input+div{
  height: var(--height);
  min-width: calc(90vmin / var(--columns));
  width: var(--height);
  background-color: var(--off-color);
  transition: background-color var(--speed, 0.1s) ease-in-out;
}
input:checked+div{
  background-color: var(--on-color);
}
button{
  min-width:4rem;
  margin:0 var(--gap);
  padding: 0.2em;
  color:var(--on-color);
  background-color:var(--bg-color);
  border-color:var(--off-color);
}
input{color:var(--on-color);}
input[name="speed"]::before{content:'🐢';}
input[name="speed"]::after{content:'🐇';}
input[name="rows"]::before{content:'rows';}
input[name="columns"]::before{content:'cols';}
</style>`
      $$('nav button', this.shadow).forEach(el => {
        el.onclick = this[el.name].bind(this)
      })
      $$('nav input[min="3"]', this.shadow).forEach(el => {
        el.oninput = () => {
          this.setAttribute(el.name, el.valueAsNumber)
          this[el.name] = el.valueAsNumber
          this.updateAutomaton()
        }
      })
      this.updateAutomaton()
    }

    get speed() {
      const speed = 1000 - $('input[name="speed"]', this.shadow).value * 16
      this.style.setProperty('--speed', `${speed}ms`)
      return speed
    }
    updateAutomaton(f = this.init) {
      this.automaton = new Automaton(
        this.rules,
        this.columns,
        this.rows,
        f,
        this.wrap
      )
      const main = $('main', this.shadow)
      main.innerHTML = ''
      for (const pos of this.automaton.keys()) {
        const label = document.createElement('label')
        const box = document.createElement('input')
        box.setAttribute('type', 'checkbox')
        box.onclick = () => this.automaton.set(pos, Number(box.checked))
        label.append(box, document.createElement('div'))
        main.append(label)
      }
      this.draw()
    }

    randomise() {
      this.updateAutomaton(() => Math.round(Math.random()))
    }

    static get observedAttributes() {
      return ['rows', 'columns', 'on-color', 'off-color', 'bg-color']
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'rows' || name === 'columns') {
        debounce(this.updateAutomaton.bind(this))
      }
      this.style.setProperty(`--${name}`, newValue)
    }

    draw() {
      const values = this.automaton.values()
      $$('input[type="checkbox"]', this.shadow).forEach(box => {
        box.checked = values.next().value
      })
    }

    next() {
      this.stop()
      this.automaton.tick()
      this.draw()
    }

    play() {
      this.stop()
      this.paused = false
      this.automaton.tick()
      this.draw()
      $('button[name="pause"]', this.shadow).innerText = 'Pause'
      this.intervalID = window.setTimeout(this.play.bind(this), this.speed)
    }

    stop() {
      this.paused = true
      $('button[name="pause"]', this.shadow).innerText = 'Unpause'
      if (this.intervalID) window.clearTimeout(this.intervalID)
    }

    pause() {
      if (this.paused) {
        this.play()
      } else {
        this.stop()
      }
    }

    clear() {
      this.automaton.clear()
      this.draw()
    }
  }
)

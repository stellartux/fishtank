import { Automaton } from './automaton.js'
import { games, Ruleset, totalRuleRegex } from './rules.js'
import { $, $$, debounce } from './utils.js'

customElements.define(
  'game-of-life',
  class GameOfLife extends HTMLElement {
    constructor() {
      super()
      this.init = this.hasAttribute('init')
        ? Function('{x, y}', `return ${this.getAttribute('init')}`)
        : () => 0
      this.wrap = Boolean(this.getAttribute('wrap'))
      this.historyLength = 50
      this.paused = true
      this.rows = Number(
        this.getAttribute('rows') || this.getAttribute('columns') || 8
      )
      this.columns = Number(this.getAttribute('columns') || this.rows)
      const rulestring = this.getAttribute('rules')
      this.rules = Ruleset(
        totalRuleRegex.test(rulestring) ? rulestring : 'B3/S23'
      )
      this.shadow = this.attachShadow({ mode: 'open' })
      this.shadow.innerHTML = `
<nav>
<input name="rules" list="games" placeholder="B3/S23" spellcheck="false"/>
<datalist id="games"></datalist>
<button name="next">Next</button>
<button name="undo">Undo</button>
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
input[name="rules"]:valid{border:medium solid #119933;}
input[name="rules"]:invalid{border-color:#dd1111;}
</style>`

      const gameList = $('#games', this.shadow)
      for (const [key, value] of Object.entries(games)) {
        const option = document.createElement('option')
        option.innerText = key
        option.setAttribute('value', value)
        gameList.append(option)
      }

      /** @type {HTMLInputElement} */
      const rules = document.querySelector('input[name="rules"]', this.shadow)
      rules.addEventListener('input', ev => {
        if (totalRuleRegex.test(rules.value)) {
          rules.setCustomValidity('')
          this.rules = Ruleset(rules.value)
          this.updateAutomaton()
        } else {
          rules.setCustomValidity('Invalid')
        }
      })

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

    updateAutomaton(fn) {
      const options = {
        width: this.columns,
        height: this.rows,
        wrap: this.wrap,
        init: fn,
        historyLength: this.historyLength
      }
      if (!fn && this.automaton) options.data = this.automaton.data
      this.automaton = new Automaton(this.rules, options)
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
      return [
        'rows',
        'columns',
        'on-color',
        'off-color',
        'bg-color',
        'wrap',
        'rules',
      ]
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (
        name === 'rows' ||
        name === 'columns' ||
        name === 'wrap' ||
        name === 'rules'
      ) {
        debounce(this.updateAutomaton.bind(this))
      }
      if (name !== 'wrap' && name !== 'rules') {
        this.style.setProperty(`--${name}`, newValue)
      }
    }

    draw() {
      const values = this.automaton.values()
      $$('input[type="checkbox"]', this.shadow).forEach(box => {
        box.checked = values.next().value
      })
    }

    next() {
      this.stop()
      this.automaton.next()
      this.draw()
    }

    play() {
      this.stop()
      this.paused = false
      this.automaton.next()
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

    undo() {
      this.stop()
      this.automaton.undo()
      this.draw()
    }
  }
)

import { h } from './lib/h.js'
import { composer } from './composer.js'
import { bogbot } from './bogbot.js' 
import { adder } from './adder.js'
import { settings } from './settings.js'
import { mykey } from './mykey.js'

export const route = async (container) => {
  const screen = h('div', {id: 'screen'})
  const scroller = h('div', {id: 'scroller'})

  const controls = h('div', {id: 'controls'})

  scroller.appendChild(controls)
  container.appendChild(screen)
  screen.appendChild(scroller)

  const src = window.location.hash.substring(1)

  if (src.length === 43) {
    window.location.hash = src + '='
  }

  if (src === await bogbot.pubkey()) {
    controls.appendChild(await composer())
  } 

  if (src === 'settings') {
    scroller.appendChild(settings)
  } 

  if (src === '') {
  }

  const query = await bogbot.query(src || mykey)

  if (query && query.length) {
    adder(query, src, scroller)
  } 

  window.onhashchange = function () {
    screen.parentNode.removeChild(screen)
    route(container)
  }
}

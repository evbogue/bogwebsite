import { h } from './lib/h.js'
import { composer } from './composer.js'
import { bogbot } from './bogbot.js' 
import { adder } from './adder.js'
import { settings } from './settings.js'
import { mykey } from './mykey.js'
import { gossip } from './trystero.js'

const feedRender = async (query, src, scroller) => {
  if (query && query.length) {
    adder(query, src, scroller)
  } else {
    if (src && src.length === 44) {
      await gossip(src)
    }
  }
}

export const route = async (container) => {
  const screen = h('div', {id: 'screen'})
  const scroller = h('div', {id: 'scroller'})
  const controls = h('div', {id: 'controls'})

  scroller.appendChild(controls)
  container.appendChild(screen)
  screen.appendChild(scroller)

  const src = window.location.hash.substring(1)

  if (src.length === 43) { window.location.hash = src + '=' }
  else if (src === await bogbot.pubkey()) { 
    controls.appendChild(await composer()) 
    await feedRender(await bogbot.query(await bogbot.pubkey()), src, scroller) 
  } 
  else if (src === '') { await feedRender(await bogbot.query(mykey), src, scroller) }
  else if (src === 'public') { await feedRender(await bogbot.query(), src, scroller) } 
  else if (src === 'settings') { scroller.appendChild(settings)} 
  else { await feedRender(await bogbot.query(src), src, scroller)}

  window.onhashchange = function () {
    screen.parentNode.removeChild(screen)
    route(container)
  }
}

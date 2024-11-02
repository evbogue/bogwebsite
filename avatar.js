import { h } from './lib/h.js'
import { bogbot } from './bogbot.js'
import { vb } from './lib/vb.js'
import { decode } from './lib/base64.js'
import { gossip } from './trystero.js'

export const avatar = async (id, msg) => {

  const img = vb(decode(id), 256)

  img.classList = 'avatar image' + id

  const name = h('span', {classList: 'name' + id}, [id.substring(0, 7) + '...'])

  if (!msg && id === await bogbot.pubkey()) {
    const getName = localStorage.getItem('name')
    if (getName) {name.textContent = getName} 
    const image = localStorage.getItem('image')
    if (image) {
      const blob = await bogbot.find(image)
      img.src = await bogbot.find(image)
      if (blob) {
        img.src = blob
      } else {
        await gossip(image)
      }
    }
  }

  if (msg && msg.name) {
    name.textContent = msg.name
  }

  if (msg && msg.image) {
    const blob = await bogbot.find(msg.image)
    if (blob) { img.src = blob} else {
      await gossip(msg.image)
    }
  }

  return h('a', {href: '#' + id}, [
    img,
    ' ',
    name,
  ])
}


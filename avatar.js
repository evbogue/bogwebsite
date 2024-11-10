import { h } from './lib/h.js'
import { bogbot } from './bogbot.js'
import { vb } from './lib/vb.js'
import { decode } from './lib/base64.js'
import { gossip } from './trystero.js'
import { parseYaml} from './yaml.js'
import { mykey } from './mykey.js'

export const loadImage = async (hash) => {
  const images = document.querySelecterAll('#' + hash)
  console.log(images)
}

export const currentAvatar = async (pubkey) => {
  if (pubkey === await bogbot.pubkey()) {
    const obj = {}
    if (localStorage.getItem('name')) { obj.name = localStorage.getItem('name')}
    if (localStorage.getItem('image')) { obj.image = localStorage.getItem('image')}
    return await avatar(pubkey, obj)
  }
  else if (pubkey === mykey) {
    const ownerLatest = await bogbot.query(pubkey)
    try {
      const extracted = await parseYaml(ownerLatest[0].text)
      return await avatar(pubkey, extracted)
    } catch (err) {
      return await avatar(pubkey)
    }
  }
}

export const avatar = async (id, msg) => {
  const img = vb(decode(id), 256)
  img.classList = 'avatar'
  if (msg && msg.image) {
    img.id = msg.image
  }

  const name = h('span', {classList: 'name' + id}, [id.substring(0, 7) + '...'])
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


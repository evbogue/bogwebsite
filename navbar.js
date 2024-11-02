import { h } from './lib/h.js'
import { bogbot } from './bogbot.js'
import { avatar } from './avatar.js'
import { search } from './search.js'
import { mykey } from './mykey.js'
import { parseYaml} from './yaml.js'

const ownerLatest = await bogbot.query(mykey)

let ownerAvatar

try {
  const extracted = await parseYaml(ownerLatest[0].text)
  ownerAvatar = await avatar(mykey, extracted)
} catch (err) {
  ownerAvatar = await avatar(mykey) 
}

document.title = ownerAvatar.textContent + "'s Bog"

export const navbar = h('navbar' , {id: 'navbar'}, [
  h('span', {style: 'float: right; margin-right: 2em;'}, [
    await avatar(await bogbot.pubkey()),
    ' | ',
    h('a', {href: '#settings'}, ['Settings'])
  ]),
  search,
  ' ',
  h('a', {href: '#' + mykey}, [ownerAvatar]),
  "'s Bog"
])

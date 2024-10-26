import { h } from './lib/h.js'
import { bogbot } from './bogbot.js'
import { avatar } from './avatar.js'
import { search } from './search.js'
import { mykey } from './mykey.js'

const pubkey = await bogbot.pubkey()

export const navbar = h('navbar' , {id: 'navbar'}, [
  h('span', {style: 'float: right; margin-right: 2em;'}, [
    await avatar(pubkey),
    ' | ',
    h('a', {href: '#settings'}, ['Settings'])
  ]),
  search,
  ' ',
  h('a', {href: '#' + mykey}, [await avatar(mykey)]),
  "'s Bog"
])

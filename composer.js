import { h } from './lib/h.js'
import { bogbot } from './bogbot.js'
import { cachekv } from './lib/cachekv.js'
import { markdown } from './markdown.js'
import { avatar } from './avatar.js'
import { render } from './render.js'
import { vb } from './lib/vb.js'
import { decode } from './lib/base64.js'

const pubkey = await bogbot.pubkey()

export const composer = async (msg) => {
  if (!msg) { msg = {hash: 'home'}}

  const textarea = h('textarea', {placeholder: 'Write a message', style: 'width: 98%;'})

  textarea.addEventListener('input', async () => {
    if (textarea.value) { 
      cachekv.put('draft:' + msg.hash, textarea.value) 
    } else {
      cachekv.rm('draft:' + msg.hash)
    }
    preview.innerHTML = await markdown(textarea.value)
  })

  const got = await cachekv.get('draft:' + msg.hash)
  textarea.value = await cachekv.get('draft' + msg.hash) || ''
  
  const preview = h('p', [await cachekv.get('draft' + msg.hash || '')])

  const button = h('button', {
    onclick: async () => {
      if (textarea.value) {
        const name = localStorage.getItem('name')
        const image = localStorage.getItem('image')
        const bio = localStorage.getItem('bio')

        let yaml

        if (name || image || bio || msg.hash != 'home') {
          yaml = '---' 
          if (name) { yaml = yaml + '\nname: ' + name }
          if (image) { yaml = yaml + '\nimage: ' + image }
          if (bio) { yaml = yaml + '\nbio: ' + bio }
          if (msg.hash && msg.hash != 'home') { yaml = yaml + '\nreply: ' + msg.hash}
          yaml = yaml + '\n---\n'
        } else { yaml = ''}

        const signed = await bogbot.publish(yaml + textarea.value)  
        const opened = await bogbot.open(signed)
        bogbot.add(signed)
        localStorage.setItem('previous', opened.hash)
        const rendered = await render(opened)
        textarea.value = ''
        cachekv.rm('draft:' + msg.hash)
        preview.textContent = ''
        if (msg && msg.hash != 'home') {
          if (composeDiv) {
            composeDiv.replaceWith(rendered)
          }
        } if (msg.hash == 'home') {
          composeDiv.after(rendered)
        }
      }
    }
  }, ['Send'])

  const img = vb(decode(pubkey), 256)
  img.classList = 'avatar image' + pubkey
  const blob = await bogbot.find(localStorage.getItem('image'))

  if (blob) { img.src = blob}

  const name = h('span', [await localStorage.getItem('name') || pubkey.substring(0, 7) + '...'])
   
  const composeDiv = h('div', {id: 'reply:' + msg.hash, classList: 'message'}, [
    h('p', {style: 'float: right;'}, ['preview']),
    await avatar(pubkey),
    preview,
    textarea,
    h('br'),
    button,
  ])

  return composeDiv
}

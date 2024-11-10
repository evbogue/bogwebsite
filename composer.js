import { h } from './lib/h.js'
import { bogbot } from './bogbot.js'
import { cachekv } from './lib/cachekv.js'
import { markdown } from './markdown.js'
import { currentAvatar } from './avatar.js'
import { render } from './render.js'
import { vb } from './lib/vb.js'
import { decode } from './lib/base64.js'
import { blastBlob } from './trystero.js'

export const composer = async (msg) => {
  if (!msg) { msg = {hash: 'home'}}

  const textarea = h('textarea', {placeholder: 'Write a message', style: 'width: 98%;'})

  const draftId = 'draft:' + msg.hash
  const draft = localStorage.getItem(draftId || '')

  const preview = h('p', [draft])

  textarea.addEventListener('input', async () => {
    if (textarea.value) {
      localStorage.setItem(draftId, textarea.value) 
    } else {
      localStorage.removeItem(draftId)
    }
    preview.innerHTML = await markdown(textarea.value)
  })

  const got = localStorage.getItem(draftId + msg.hash)
  textarea.value = draft

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
        blastBlob(opened.raw)
        cachekv.rm(draftId)
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

  const composeDiv = h('div', {id: 'reply:' + msg.hash, classList: 'message'}, [
    h('p', {style: 'float: right;'}, ['preview']),
    await currentAvatar(await bogbot.pubkey()),
    preview,
    textarea,
    h('br'),
    button,
  ])

  return composeDiv
}

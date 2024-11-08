import { h } from './lib/h.js'
import { cachekv } from './lib/cachekv.js'
import { bogbot } from './bogbot.js'
import { decode } from './lib/base64.js'
import { vb } from './lib/vb.js'

const keypair = await bogbot.keypair()
const pubkey = await bogbot.pubkey()

const input = h('input', {placeholder: localStorage.getItem('name') || pubkey})

const saveName = h('button', {
  onclick: async () => {
    if (input.value) {
      localStorage.setItem('name', input.value)
      input.placeholder = input.value
      const namesOnScreen = document.getElementsByClassName('name' + pubkey)
      for (const names of namesOnScreen) {
        names.textContent = input.value
      }
      input.value = ''
    }
  }
}, ['Save name'])

const bio = h('textarea', {placeholder: await bogbot.find(await localStorage.getItem('bio')) || 'Write a bio'})

const saveBio = h('button', {
  onclick: async () => {
    if (bio.value) {
      const biohash = await bogbot.make(bio.value)
      localStorage.setItem('bio', biohash)
      bio.placeholder = bio.value
      bio.value = ''
    }
  }
}, ['Save bio'])

const uploadButton = h('button', {
  onclick: () => {
    uploader.click()
  }
}, ['Upload profile photo'])

const uploader = h('input', {
  type: 'file', style: 'display: none;', onchange: (e) => {
    const file = e.srcElement.files[0]
    const reader = new FileReader()
    reader.onloadend = async () => {
      img.src = await reader.result
      const imagesOnScreen = document.getElementsByClassName('image' + pubkey)
      for (const image of imagesOnScreen) {
        image.src = img.src
      }
      const blob = await bogbot.make(img.src)
      localStorage.setItem('image', blob)
    }
    reader.readAsDataURL(file)
}})

const img = vb(decode(pubkey), 256)

img.classList = 'avatarbig image' + pubkey

if (localStorage.getItem('image')) {
  const blob = await bogbot.find(localStorage.getItem('image'))
  img.src = blob
}

const textarea = h('textarea', [keypair])

const deleteKeypair = h('button', {
  style: 'float: right;',
  onclick: async () => {
    await bogbot.deletekey()
    location.href = '#'
    location.reload()
  }
}, ['Delete Keypair'])

const deleteEverything = h('button', {
  style: 'float: right;',
  onclick: async () => {
    await cachekv.clear()
    await localStorage.clear()
    await bogbot.deletekey() 
    location.href = '#'
    location.reload()
  }
}, ['Delete Everything'])

const saveButton = h('button', {
  onclick: async () => {
    if (textarea.value && textarea.value.length === keypair.length) {
      await localStorage.setItem('keypair', textarea.value)
    } else {
      alert('Invalid Keypair')
    }
    location.href = '#'
    location.reload()
  }
}, ['Save keypair'])

export const settings = h('div', {classList: 'message'}, [
  img,
  h('br'),
  uploadButton,
  h('br'),
  h('hr'),
  'Name: ',
  input,
  saveName,
  h('br'),
  h('hr'),
  bio,
  saveBio,
  h('br'),
  h('hr'),
  'Keypair:',
  h('br'),
  textarea,
  h('br'),
  deleteKeypair,
  deleteEverything,
  saveButton
])

import { h } from './lib/h.js'
import { human } from './lib/human.js'
import { avatar } from './avatar.js'
import { bogbot } from './bogbot.js'
import { markdown } from './markdown.js'
import { composer } from './composer.js'
import { extractYaml } from 'https://esm.sh/v135/@jsr/std__front-matter@1.0.5/mod.js'
import { parse } from 'https://esm.sh/v135/@jsr/std__yaml@1.0.5/mod.js'

const getThreads = async (m, replyDiv) => {
  const threads = await bogbot.query('?' + m.hash)

  if (threads && threads[0]) {
    threads.forEach(async (item) => {
      const getMsg = document.getElementById(item.hash)
      if (!getMsg) {
        const rendered = await render(item)
        replyDiv.appendChild(rendered)
      }
    })
  }
}

const populate = async (m, msgDiv) => {
  let pubkey

  const content = h('div', {id: m.data})

  const blob = await bogbot.find(m.data)
  if (blob) {
    try {    
      const extract = await extractYaml(blob)
      const front = await parse(extract.frontMatter)
      pubkey = await avatar(m.author, front)    
      content.innerHTML = await markdown(extract.body)
    } catch (err) {
      pubkey = await avatar(m.author)
      content.innerHTML = await markdown(blob)
    }
  }

  const previous = await bogbot.query(m.previous)

  const ts = h('a', {href: '#' + m.hash }, [human(new Date(m.timestamp))])

  const raw = h('code')

  const prev = h('a', { href: '#' + m.previous
  }, [h('code', ['prev'])])

  const rawButton = h('code', {
    style: 'cursor: pointer;',
    href: '',
    onclick: (e) => {
      e.preventDefault()
      if (!raw.textContent) {
        raw.textContent = JSON.stringify(m)
      } else { raw.textContent = ''} 
    }
  }, ['raw'])

  setInterval(() => {
    ts.textContent = human(new Date(m.timestamp))
  }, 10000)

  const right = h('span', {style: 'float: right;'}, [
    rawButton,
    ' ',
    prev,
    ' ',
    h('code', [m.author.substring(0, 7)]),
    ' ',
    ts
  ])

  const reply = h('button', {
    onclick: async () => {
      const compose = await composer(m)
      const replyAlready = document.getElementById('reply:' + m.hash)
      if (replyDiv.firstChild && !replyAlready) {
        replyDiv.insertBefore(compose, replyDiv.firstChild)
      } else if (!replyAlready) {
        replyDiv.appendChild(compose)
      } if (replyAlready) { replyAlready.remove()}
    }
  }, ['Reply'])

  const div = h('div', {id: m.hash, classList: 'message'}, [
    right, 
    pubkey,
    ' ', 
    content,
    raw,
    reply
  ])

  msgDiv.appendChild(div)

  const replyDiv = h('div', {classList: 'indent'})

  msgDiv.appendChild(replyDiv)

  getThreads(m, replyDiv)
}

export const render = (m) => {
  const msgDiv = h('div')
  populate(m, msgDiv)
  return msgDiv
}
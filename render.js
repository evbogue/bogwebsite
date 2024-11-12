import { h } from './lib/h.js'
import { human } from './lib/human.js'
import { avatar } from './avatar.js'
import { bogbot } from './bogbot.js'
import { markdown } from './markdown.js'
import { composer } from './composer.js'
import { parseYaml} from './yaml.js'
import { gossip } from './trystero.js'

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

export const populate = async (m, msgDiv) => {
  let pubkey

  const content = h('div', {id: m.data})

  const blob = await bogbot.find(m.data)
  if (blob) {
    try {
      const extracted = await parseYaml(blob) 
      content.innerHTML = await markdown(extracted.body)
      pubkey = await avatar(m.author, extracted)
    } catch (err) {
      console.log(err)
    }
  } else {
    pubkey = await avatar(m.author)
    await gossip(m.data, m.author)      
  }

  if (m.previous != m.hash) {
    const previous = await bogbot.query(m.previous)
    //console.log(previous)
    if (previous && !previous.length) {
      console.log('WE DO NOT HAVE PREVIOUS')
      if (!document.getElementById(m.previous)) {
        msgDiv.after(h('div', {id: m.previous}))
        gossip(m.previous)
      }
    }
  }

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
  const msgDiv = h('div', {id: m.hash})
  populate(m, msgDiv)
  return msgDiv
}

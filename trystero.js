import { joinRoom } from './lib/trystero-torrent.min.js'
import { bogbot } from './bogbot.js'
import { encode } from './lib/base64.js'
import { render } from './render.js'
import { markdown } from './markdown.js'

export const rooms = new Map()

const queue = new Set()

export const gossip = async (hash, author) => {
  console.log('Gossiping: ' + hash + ' by ' + author)
  queue.add(hash)

  let speed = 1

  const ask = () => {
    if (queue.has(hash)) {
      console.log('Asking for: ' + hash + 'in channel ' + author)
      speed++
      //if (author) {
      //  const room = rooms.get(author)
      //  if (room && room.sendHash) {
      //    room.sendHash(hash)
      //  }
      //} else {
        const values = [...rooms.values()]
        const room = values[Math.floor(Math.random() * values.length)]
        console.log(room)
        if (room.sendHash) {
          room.sendHash(hash)
        }
      //}
      setTimeout(() => {
        ask()
      }, (1000 * speed)) 
    }
  }

  ask()
}

export const makeRoom = async (pubkey) => {
  const room = joinRoom({appId: 'bogsite', password: 'password'}, pubkey)
  
  const [ sendHash, onHash ] = room.makeAction('hash')
  const [ sendBlob, onBlob ] = room.makeAction('blob')

  room.sendHash = sendHash
  
  onHash(async (hash, id) => {
    //console.log('Received: ' + hash)
    try {
      const q = await bogbot.query(hash)
      if (q && q.length) { 
        const blob = q[q.length - 1]
        console.log('Sending: ' + blob.raw)
        sendBlob(blob.raw, id)
      } else {
        const b = await bogbot.find(hash)
        if (b) {
          console.log('Sending: ' + b)
          sendBlob(b, id)
        } 
      }
    } catch (err) {
      console.log(err)
    }
  })
  
  onBlob(async (blob, id) => {
    console.log(blob)
    let opened 
    try { 
      const open = await bogbot.open(blob)
      if (open) { opened = open} 
    } catch (err) {}
    if (opened) {
      const src = window.location.hash.substring(1)
      if (src === '' || src === opened.author || src === opened.hash) {
        const el = document.getElementById(opened.hash)
        if (!el) {
          const rendered = await render(opened)
          const scroller = document.getElementById('scroller')
          scroller.firstChild.after(rendered)
        }
      }
      await bogbot.add(opened.raw)
    } else {
      const hash = encode(Array.from(
        new Uint8Array(
          await crypto.subtle.digest("SHA-256", new TextEncoder().encode(blob))
        ))
      )
      const q = await bogbot.query(hash)
      bogbot.make(blob)
      const got = document.getElementById(hash)
      console.log(got.parentNode.id)
      if (got) {
        const mark = await markdown(blob)
        got.innerHTML = mark        
      }
      try {queue.delete(hash)} catch (err) {}
    } 
  })
  
  room.onPeerJoin(id => {
    console.log(id + ' joined the room ' + pubkey)
    sendHash(pubkey, id)
  })
  
  room.onPeerLeave(id => {
    console.log(id + ' left the room ' + pubkey)
  })

  rooms.set(pubkey, room)
}

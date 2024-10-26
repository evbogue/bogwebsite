import { joinRoom } from './lib/trystero-torrent.min.js'

export const rooms = new Map()

//export const wants = new Set()

export const makeRoom = async (pubkey) => {
  const room = joinRoom({appId: 'bogsite', password: 'password'}, pubkey)
  
  const [ sendHash, onHash ] = room.makeAction('hash')
  const [ sendBlob, onBlob ] = room.makeAction('blob')

  room.sendHash = sendHash
  
  onHash((data, id) => {
    console.log(data)
  })
  
  onBlob((data, id) => {
    console.log(data)
  })
  
  room.onPeerJoin(id => {
    console.log(id + ' joined the room ' + pubkey)
    sendHash(pubkey, id)
  })
  
  room.onPeerLeave(id => {
    console.log(id + ' left the room ' + pubkey)
  })

  rooms.set(pubkey, room)
  console.log(room)
}

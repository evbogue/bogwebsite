import { route } from './route.js'
import { bogbot } from './bogbot.js'
import { navbar } from './navbar.js'
import { makeRoom } from './trystero.js'
import { mykey} from './mykey.js'

const pubkey = await bogbot.pubkey()

await makeRoom(pubkey)
await makeRoom(mykey)

if (!window.location.hash) { window.location = '#' }

document.body.appendChild(navbar)

route(document.body)

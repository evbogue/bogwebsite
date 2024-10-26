import { generate } from './bogbot.js'

let run = true

while (run === true) {
  const genkey = await generate()
  if (genkey.startsWith(('Ev' || 'ev' || 'EV' || 'e' ))) { console.log(genkey)}
}

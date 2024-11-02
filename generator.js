import { generate } from './bogbot.js'

console.log(Deno.args[0])

let run = true

while (run === true) {
  const genkey = await generate()
  if (genkey.toUpperCase().startsWith((Deno.args[0].substring(0, 2).toUpperCase()))) { console.log(genkey)}
}

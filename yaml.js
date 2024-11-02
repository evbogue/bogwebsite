import { extractYaml } from './lib/frontmatter.js'
import { parse } from './lib/yaml.js'

export const parseYaml = async (doc) => {
  const extracted = await extractYaml(doc)
  const front = await parse(extracted.frontMatter)
  front.body = extracted.body
  return front
}

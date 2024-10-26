import { h } from './lib/h.js'

export const search = h('input', {id: 'search', placeholder: 'Search', style: 'float: right; margin-right: 10px;'})

search.addEventListener('input', () => {
  location.hash = '?' + search.value
  setTimeout(() => {
    search.focus()
  }, 5)
})

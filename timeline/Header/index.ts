import { div, h1 } from '@cycle/dom'
import xs from 'xstream'

export default function Header() {
  return {
    DOM: xs.of(div('.Header', [
      h1('.Header-title', 'Timeline'),
    ])),
  }
}

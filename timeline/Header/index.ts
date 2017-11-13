import { div } from '@cycle/dom'
import xs from 'xstream'

export default function Header() {
  return {
    DOM: xs.of(div('.Header', [
      div('.Header-title', 'Timeline'),
    ])),
  }
}

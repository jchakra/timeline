import { div, i } from '@cycle/dom'
import xs from 'xstream'

export default function Header() {
  return {
    DOM: xs.of(div('.Header', [
      i('.material-icons', 'timeline'),
      div('.Header-title', 'Timeline'),
    ])),
  }
}

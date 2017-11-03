import { button, div, DOMSource, makeDOMDriver, p, VNode } from '@cycle/dom'
import { run } from '@cycle/run'
import xs, { Stream } from 'xstream'

interface ISources {
  DOM: DOMSource
}

interface ISinks {
  DOM: Stream<VNode>
}

function main(sources: ISources): ISinks {

  const action$ = xs.merge(
    sources.DOM.select('.decrement').events('click').map((_) => -1),
    sources.DOM.select('.increment').events('click').map((_) => +1),
  )
  const count$ = action$.fold((acc, x) => acc + (x as number), 0)
  const vdom$ = count$.map((count) =>
    div([
      button('.decrement', 'Decrement'),
      button('.increment', 'Increment'),
      p('Counter: ' + count),
    ]),
  )

  return {
    DOM: vdom$,
  }
}

run(main, {
  DOM: makeDOMDriver('#main-container'),
})

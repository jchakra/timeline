import { button, div, p } from '@cycle/dom'
import xs from 'xstream'

import { IAppState, ISinks, ISources } from 'timeline'

export default function main(sources: ISources): ISinks {

  const state$ = sources.onion.state$
  const vdom$ = state$.map(({count}) =>
    div([
      button('.decrement', 'Decrement'),
      button('.increment', 'Increment'),
      p('Counter: ' + count),
    ]),
  )

  const initReducer$ = xs.of((prev: IAppState) => (prev !== undefined ? prev : { count: 0 }))

  const addReducer$ = sources.DOM.select('.increment').events('click')
    .mapTo((prev: IAppState) => ({ count: prev.count + 1 }))

  const subReducer$ = sources.DOM.select('.decrement').events('click')
    .mapTo((prev: IAppState) => ({ count: prev.count - 1 }))

  const reducer$ = xs.merge(initReducer$, addReducer$, subReducer$)

  return {
    DOM: vdom$,
    onion: reducer$,
  }
}

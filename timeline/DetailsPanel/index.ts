import { button, div } from '@cycle/dom'
import { Reducer } from 'cycle-onionify'
import xs from 'xstream'

import { ISinks, ISources } from 'timeline'

export type IDetailsPanelState = any

export default function DetailsPanel(sources: ISources<IDetailsPanelState>): ISinks<IDetailsPanelState> {

  const state$ = sources.onion.state$

  const clickMeReducer$ = sources.DOM.select('.xx').events('click')
    .map(() => (state: IDetailsPanelState) => ({ ...state, x: 100, y: 50  }))

  const initReducer$ = xs.of((prev: IDetailsPanelState) => prev !== undefined ? prev : { })

  const vdom$ = xs.combine(state$)
    .map(([state]) =>
      div('#DetailsPanel', [
        JSON.stringify(state),
        button('.xx', 'Click me!')]),
    )

  const reducer$ = xs.merge<Reducer<IDetailsPanelState>>(initReducer$, clickMeReducer$)

  return {
    DOM: vdom$,
    onion: reducer$,
  }
}

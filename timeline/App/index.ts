import { div } from '@cycle/dom'
import isolate from '@cycle/isolate'
import { Reducer } from 'cycle-onionify'
import xs from 'xstream'

import { ISinks, ISources } from 'timeline'
import CardsPanel, { ICardsPanelState } from 'timeline/CardsPanel'
import Header from 'timeline/Header'

export interface IAppState {
  cardsPanel: ICardsPanelState
}

const TimelineLens = {
  get: (state: IAppState) => state.cardsPanel,
  set: (state: IAppState, childState: ICardsPanelState) => ({ ...state, cardsPanel: childState }),
}

export default function main(sources: ISources<IAppState>): ISinks<IAppState> {
  const headerSinks = Header()
  const timelineSinks = isolate(CardsPanel, { onion: TimelineLens })(sources)

  const vdom$ = xs.combine(headerSinks.DOM, timelineSinks.DOM)
    .map(([headerDOM, timelineDOM]) =>
      div('.App', [headerDOM, timelineDOM]))

  const initReducer$ = xs.of((prev: IAppState) => (prev !== undefined ? prev : { cardsPanel: { cards: [] } }))
  const reducer$ = xs.merge<Reducer<IAppState>>(initReducer$, timelineSinks.onion)

  return {
    DOM: vdom$,
    Timeline: timelineSinks.Timeline,
    onion: reducer$,
  }
}

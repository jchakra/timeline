import { div } from '@cycle/dom'
import isolate from '@cycle/isolate'
import { makeCollection } from 'cycle-onionify'
import xs from 'xstream'

import { ISinks, ISources } from 'timeline'
import Card, { ICardState } from 'timeline/Cards'

export interface ITimelineState {
  cards: ICardState[]
}

const Cards = makeCollection({
  collectSinks: (instances) => ({
    DOM: instances.pickCombine('DOM'),
    onion: instances.pickMerge('onion'),
  }),
  item: Card,
  itemKey: (_, index) => String(index),
  itemScope: (key) => key,
})

export const CardsLens = {
  get: (state: ITimelineState) => state.cards,
  set: (state: ITimelineState, childState: ICardState) => ({ ...state, cards: childState }),
}

export default function Timeline(sources: ISources<ITimelineState>): ISinks<ITimelineState> {

  const cardsSinks = isolate(Cards, { onion: CardsLens })(sources) as ISinks<ITimelineState>

  const state$ = sources.onion.state$

  const timelineActions$ = sources.DOM.select('.Timeline')
    .events('click').map((event: MouseEvent) => ({
        payload: { x: event.offsetX, y: event.offsetY },
        type: 'addCard',
      }),
    )

  const initReducer$ = xs.of((prev: ITimelineState) => prev !== undefined ? prev : { cards: [] })

  const addCardReducer$ = timelineActions$
    .filter(({ type }) => type === 'addCard')
    .map(({ payload }) => (state: ITimelineState) => ({ ...state, cards: state.cards.concat(payload) }))

  const vdom$ = xs.combine(state$, cardsSinks.DOM)
    .map(([_, cardsVDOM]) =>
      div('.Timeline', cardsVDOM),
    )

  const reducer$ = xs.merge(initReducer$, addCardReducer$, cardsSinks.onion)

  return {
    DOM: vdom$,
    onion: reducer$,
  }
}

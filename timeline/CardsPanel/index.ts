import { div } from '@cycle/dom'
import isolate from '@cycle/isolate'
import { makeCollection, Reducer } from 'cycle-onionify'
import xs from 'xstream'

import { ISinks, ISources } from 'timeline'
import Card, { ICardState } from 'timeline/Cards'

export interface ICardsPanelState {
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

const CardsLens = {
  get: (state: ICardsPanelState) => state.cards,
  set: (state: ICardsPanelState, childState: ICardState) => ({ ...state, cards: childState }),
}

export default function CardsPanel(sources: ISources<ICardsPanelState>): ISinks<ICardsPanelState> {

  const cardsSinks = isolate(Cards, { onion: CardsLens })(sources)

  const state$ = sources.onion.state$

  const timelineClickAction$ = sources.Timeline.events('click')
    .map((event: MouseEvent) => ({
        payload: { x: event.offsetX, y: event.offsetY },
        type: 'timelineClick',
      }),
    )

  const timelineMouseoverAction$ = sources.Timeline.events('mousemove')
    .map((event: MouseEvent) => ({
        payload: { x: event.offsetX, y: event.offsetY },
        type: 'timelineOver',
      }),
    )

  const initReducer$ = xs.of((prev: ICardsPanelState) => prev !== undefined ? prev : { cards: [] })

  const addCardReducer$ = timelineClickAction$
    .filter(({ type }) => type === 'timelineClick')
    .map(({ payload }) => (state: ICardsPanelState) => ({ ...state, cards: state.cards.concat(payload) }))

  const vdom$ = xs.combine(state$, cardsSinks.DOM)
    .map(([_, cardsVDOM]) =>
      div('.Timeline', cardsVDOM),
    )

  const reducer$ = xs.merge<Reducer<ICardsPanelState>>(initReducer$, addCardReducer$, cardsSinks.onion)

  return {
    DOM: vdom$,
    Timeline: xs.merge(timelineClickAction$, timelineMouseoverAction$),
    onion: reducer$,
  }
}

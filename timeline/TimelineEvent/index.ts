import { div } from '@cycle/dom'
// import { Reducer } from 'cycle-onionify'
import xs from 'xstream'

import { ISinks, ISources } from 'timeline'

export interface ITimelineEventState {
  x: number
  y: number
  key: string
  selected: boolean
  description?: {}
  color?: string
  width?: number
  dragged?: boolean
}

export default function TimelineEvent(sources: ISources<ITimelineEventState>): ISinks<ITimelineEventState> {
  const state$ = sources.onion.state$

  const selected$ = sources.DOM.select('.TimelineEvent').events('click')
    .map((event) => event.stopPropagation())
    .mapTo(({ type: 'selectTimelineEvent' }))

  const selectedReducer$ =  selected$
    .map(() =>
      (state: ITimelineEventState) =>
        ({ ...state, selected: !state.selected }))

  const reducer$ = xs.merge(selectedReducer$)

  const vdom$ = state$.map((state) =>
    div(
      '.TimelineEvent',
      {
        attrs: { draggable: 'true' },
        style: { left: `${state.x - 6}px`, top: `${state.y - 6}px`, borderColor: (state.selected) ? '#FFF' : '#000' } },
      '',
    ),
  )

  return {
    DOM: vdom$,
    onion: reducer$,
  }
}

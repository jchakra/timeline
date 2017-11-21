import { div } from '@cycle/dom'
import { Reducer } from 'cycle-onionify'
import xs, { Stream } from 'xstream'

import { ISinks, ISources } from 'timeline'

export interface ITimelineEventDescriptionState {
  name: string
  description: string
}

export interface ITimelineEventState {
  x: number
  y: number
  key: string
  selected: boolean
  description: ITimelineEventDescriptionState
  color?: string
  width?: number
}

export function createTimelineEvent(x: number, y: number): ITimelineEventState {
  return {
    color: '',
    description: {
      description: '',
      name: '',
    },
    key: +new Date() + '',
    selected: false,
    width: 0,
    x,
    y,
  }
}

export default function TimelineEvent(sources: ISources<ITimelineEventState>): ISinks<ITimelineEventState> {
  const state$ = sources.onion.state$

  const selected$ = sources.DOM.select('.TimelineEvent').events('mousedown')
    .map((event) => event.stopPropagation())
    .mapTo(({ type: 'selectTimelineEvent' }))

  const selectedReducer$ =  selected$
    .map(() =>
      (state: ITimelineEventState) =>
        ({ ...state, selected: !state.selected })) as Stream<Reducer<ITimelineEventState>>

  const reducer$ = xs.merge<Reducer<ITimelineEventState>>(selectedReducer$)

  const vdom$ = state$.map((state) =>
    div(
      '.TimelineEvent',
      {
        attrs: { draggable: 'true' },
        style: {
          backgroundColor: state.color !== '' ? state.color : null,
          borderColor: (state.selected) ? '#FFF' : '#000',
          left: `${state.x - 9}px`,
          top: `${state.y - 9}px`,
          width: `${state.width}px`,
        },
      },
      '',
    ),
  )

  return {
    DOM: vdom$,
    onion: reducer$,
  }
}

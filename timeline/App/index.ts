import { div } from '@cycle/dom'
import isolate from '@cycle/isolate'
import { Reducer } from 'cycle-onionify'
import xs from 'xstream'

import { ISinks, ISources } from 'timeline'
import Header from 'timeline/Header'
import Timeline, { ITimelineState } from 'timeline/Timeline'

export interface IAppState {
  timeline: ITimelineState
}

export const TimelineLens = {
  get: (state: IAppState) => state.timeline,
  set: (state: IAppState, childState: ITimelineState) => ({ ...state, timeline: childState }),
}

export default function main(sources: ISources<IAppState>): ISinks<IAppState> {
  const headerSinks = Header()
  const timelineSinks = isolate(Timeline, { onion: TimelineLens })(sources)

  const vdom$ = xs.combine(headerSinks.DOM, timelineSinks.DOM)
    .map(([headerDOM, timelineDOM]) =>
      div('.App', [headerDOM, timelineDOM]))

  const initReducer$ = xs.of((prev: IAppState) => (prev !== undefined ? prev : { timeline: { cards: [] } }))
  const reducer$ = xs.merge<Reducer<IAppState>>(initReducer$, timelineSinks.onion)

  return {
    DOM: vdom$,
    onion: reducer$,
  }
}

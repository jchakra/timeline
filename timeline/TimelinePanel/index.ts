import { div } from '@cycle/dom'
import isolate from '@cycle/isolate'
import { makeCollection, Reducer } from 'cycle-onionify'
import xs from 'xstream'

import { ISinks, ISources } from 'timeline'
import TimelineEvent, { ITimelineEventState } from 'timeline/TimelineEvent'

export interface ITimelinePanelState {
  timelineEvents: ITimelineEventState[]
  selectedTimelineEvent: ITimelineEventState|null
}

const TimelineEvents = makeCollection({
  collectSinks: (instances) => ({
    DOM: instances.pickCombine('DOM'),
    onion: instances.pickMerge('onion'),
  }),
  item: TimelineEvent,
  itemKey: (_, index) => String(index),
  itemScope: (key) => key,
})

const TimelineEventLens = {
  get: (state: ITimelinePanelState) => state.timelineEvents,
  set: (state: ITimelinePanelState, childState: ITimelineEventState[]) => {
    const oldSelected = state.selectedTimelineEvent
    const newSelected = childState
      .filter((tev) => tev.selected && ( oldSelected ? tev.key !== oldSelected.key : true))[0]

    return {
      ...state,
      selectedTimelineEvent: newSelected || null,
      timelineEvents: childState.map((tev) => ({
        ...tev,
        selected: newSelected ? tev.key === newSelected.key : false,
      })),
    }
  },
}

export default function Timeline(sources: ISources<ITimelinePanelState>): ISinks<ITimelinePanelState> {

  const timelineEventsSinks = isolate(TimelineEvents, { onion: TimelineEventLens })(sources)

  const state$ = sources.onion.state$

  const timelineClickAction$ = sources.DOM.select('.Timeline').events('click')
    .map((event) => ({
      payload: {
        key: +new Date() + '',
        selected: false,
        x: event.offsetX,
        y: event.offsetY,
      },
      type: 'addTimelineEvent',
    }))

  const initReducer$ =  xs.of((prev: ITimelinePanelState) =>
    prev !== undefined ? prev : { timelineEvents: [], selectedTimelineEvent: null })

  const addTimelineEventReducer$ = timelineClickAction$
    .filter(({ type }) => type === 'addTimelineEvent')
    .map(({ payload }) =>
      (state: ITimelinePanelState) =>
        ({ ...state, timelineEvents: state.timelineEvents.concat(payload) }))

  const reducer$ = xs.merge<Reducer<ITimelinePanelState>>(
    initReducer$,
    addTimelineEventReducer$,
    timelineEventsSinks.onion,
  )

  const vdom$ = xs.combine(state$, timelineEventsSinks.DOM)
  .map(([_, timelineEventsVDOM]) =>
    div('.Timeline', div('', timelineEventsVDOM)),
  )

  return {
    DOM: vdom$,
    onion: reducer$,
  }
}

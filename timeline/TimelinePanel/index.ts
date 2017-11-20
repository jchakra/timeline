import { div } from '@cycle/dom'
import isolate from '@cycle/isolate'
import { makeCollection, Reducer } from 'cycle-onionify'
import xs, { Stream } from 'xstream'

import { ISinks, ISources } from 'timeline'
import TimelineEvent, { createTimelineEvent, ITimelineEventState } from 'timeline/TimelineEvent'

export interface ITimelinePanelState {
  timelineEvents: ITimelineEventState[]
  selectedTimelineEvent: number
}

export const initialState: ITimelinePanelState = {
  selectedTimelineEvent: -1,
  timelineEvents: [],
}

const TimelineEvents = makeCollection({
  collectSinks: (instances) => ({
    DOM: instances.pickCombine('DOM'),
    onion: instances.pickMerge('onion'),
  }),
  item: TimelineEvent,
  itemKey: (state: ITimelineEventState) => state.key,
  itemScope: (key) => key,
})

const TimelineEventLens = {
  get: (state: ITimelinePanelState) => state.timelineEvents,
  set: (state: ITimelinePanelState, childState: ITimelineEventState[]) => {
    const oldSelected = state.timelineEvents[state.selectedTimelineEvent]
    const newSelected = childState
      .filter((tev) => tev.selected && ( oldSelected ? tev.key !== oldSelected.key : true))[0]

    return {
      ...state,
      selectedTimelineEvent: newSelected ? state.timelineEvents.findIndex((tev) => tev.key === newSelected.key) : -1,
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
        x: event.offsetX,
        y: event.offsetY,
      },
      type: 'addTimelineEvent',
    }))

  const initReducer$ =  xs.of((prev: ITimelinePanelState) =>
    prev !== undefined ? prev : initialState) as Stream<Reducer<ITimelinePanelState>>

  const addTimelineEventReducer$ = timelineClickAction$
    .map(({ payload }) =>
      (state: ITimelinePanelState) =>
        ({
          ...state,
          timelineEvents: state.timelineEvents.concat(createTimelineEvent(payload.x, payload.y)),
        }),
    ) as Stream<Reducer<ITimelinePanelState>>

  const reducer$ = xs.merge<Reducer<ITimelinePanelState>>(
    initReducer$,
    addTimelineEventReducer$,
    timelineEventsSinks.onion,
  )

  const cursorLine$ = sources.DOM.select('.Timeline__layer').events('mousemove')
    .map((event: MouseEvent) => ({ mx: event.offsetX, my: event.offsetY }))

  const cursorOut$ = sources.DOM.select('.Timeline__layer').events('mouseout')
      .mapTo(null)

  const cursor$ = xs.merge(cursorLine$, cursorOut$).startWith(null)

  const vdom$ = xs.combine(state$, cursor$, timelineEventsSinks.DOM)
    .map(([_, cursor, timelineEventsVDOM]) =>
      div('.Timeline', [
        div('',  timelineEventsVDOM),
        div('.Timeline__layer', [
          cursor && div('.Timeline--cursor .Timeline--cursor-x', { style: { left:  `${cursor.mx - 1 }px` } }, ''),
          cursor && div('.Timeline--cursor .Timeline--cursor-y', { style: { top: `${cursor.my - 1 }px` } }, ''),
        ]),
      ]),
    )

  return {
    DOM: vdom$,
    onion: reducer$,
  }
}

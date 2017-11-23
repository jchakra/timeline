import { div } from '@cycle/dom'
import isolate from '@cycle/isolate'
import { makeCollection, Reducer } from 'cycle-onionify'
import xs from 'xstream'

import { ISinks, ISources } from 'timeline'
import TimelineEvent, { ITimelineEventState } from 'timeline/TimelineEvent'

import intent from './intent'
import model from './model'

export interface ITimelinePanelState {
  timelineEvents: ITimelineEventState[]
  selectedTimelineEvent: number
  currentlyCreated?: ITimelineEventState
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

  const actions = intent(sources)
  const reducer$ = model(actions)

  const cursorLine$ = sources.DOM.select('.Timeline__layer').events('mousemove')
    .map((event: MouseEvent) => ({ mx: event.offsetX, my: event.offsetY }))

  const cursorOut$ = sources.DOM.select('.Timeline__layer').events('mouseout')
      .mapTo(null)

  const cursor$ = xs.merge(cursorLine$, cursorOut$).startWith(null)

  const vdom$ = xs.combine(state$, cursor$, timelineEventsSinks.DOM)
    .map(([state, cursor, timelineEventsVDOM]) =>
      div('.Timeline', [
        div('',  timelineEventsVDOM),
        state.currentlyCreated  && div('.Timeline__drawer', {
            style: {
              left: `${state.currentlyCreated.x - 9}px`,
              top: `${state.currentlyCreated.y - 9}px`,
              width: `${state.currentlyCreated.width}px`,
            },
          },
          '',
        ),
        div('.Timeline__layer', [
          cursor && div('.Timeline--cursor .Timeline--cursor-x', { style: { left:  `${cursor.mx - 1 }px` } }, ''),
          cursor && div('.Timeline--cursor .Timeline--cursor-y', { style: { top: `${cursor.my - 1 }px` } }, ''),
        ]),
      ]),
    )

  return {
    DOM: vdom$,
    onion: xs.merge<Reducer<ITimelinePanelState>>(reducer$, timelineEventsSinks.onion),
  }
}

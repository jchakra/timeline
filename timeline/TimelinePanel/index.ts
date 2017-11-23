import { div } from '@cycle/dom'
import isolate from '@cycle/isolate'
import { makeCollection, Reducer } from 'cycle-onionify'
import xs from 'xstream'

import { ISinks, ISources } from 'timeline'
import TimelineEvent, { ITimelineEventState } from 'timeline/TimelineEvent'
import TimelineSection, { ITimelineSectionState } from 'timeline/TimelineSection'

import intent from './intent'
import model from './model'

export interface ITimelinePanelState {
  timelineEvents: ITimelineEventState[]
  timelineSections: ITimelineSectionState[]
  selectedTimelineEvent: number
  eventCurrentlyCreated?: ITimelineEventState
  sectionCurrentlyCreated?: ITimelineSectionState
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

const TimelineSections = makeCollection({
  collectSinks: (instances) => ({
    DOM: instances.pickCombine('DOM'),
    onion: instances.pickMerge('onion'),
  }),
  item: TimelineSection,
  itemKey: (state: ITimelineSectionState) => state.key,
  itemScope: (key) => key,
})

const TimelineSectionsLens = {
  get: (state: ITimelinePanelState) => state.timelineSections,
  set: (state: ITimelinePanelState, childState: ITimelineSectionState[]) => {
    return {
      ...state,
      timelineSections: childState,
    }
  },
}

export default function Timeline(sources: ISources<ITimelinePanelState>): ISinks<ITimelinePanelState> {

  const timelineEventsSinks = isolate(TimelineEvents, { onion: TimelineEventLens })(sources)
  const timelineSectionsSinks = isolate(TimelineSections, { onion: TimelineSectionsLens })(sources)

  const state$ = sources.onion.state$

  const action$ = intent(sources)
  const reducer$ = model(action$)

  const cursorEventsLine$ = sources.DOM.select('.Timeline__events-layer').events('mousemove')
    .map((event: MouseEvent) => ({ mx: event.offsetX, my: event.offsetY }))

  const cursorEventsOut$ = sources.DOM.select('.Timeline__events-layer').events('mouseout')
      .mapTo(null)

  const cursorEvents$ = xs.merge(cursorEventsLine$, cursorEventsOut$).startWith(null)

  const cursorSectionsLine$ = sources.DOM.select('.Timeline__sections-layer').events('mousemove')
  .map((event: MouseEvent) => ({ mx: event.offsetX }))

  const cursorSectionsOut$ = sources.DOM.select('.Timeline__sections-layer').events('mouseout')
    .mapTo(null)

  const cursorSections$ = xs.merge(cursorSectionsLine$, cursorSectionsOut$).startWith(null)

  const vdom$ = xs.combine(state$, cursorSections$, cursorEvents$, timelineSectionsSinks.DOM, timelineEventsSinks.DOM)
    .map(([state, cursorSections, cursorEvents, timelineSectionsVDOM, timelineEventsVDOM]) =>
      div('.Timeline', [
        div('.Timeline__sections', [
          div('',  timelineSectionsVDOM),
          state.sectionCurrentlyCreated  && div('.Timeline__sections-drawer', {
              style: {
                left: `${state.sectionCurrentlyCreated.x}px`,
                width: `${state.sectionCurrentlyCreated.width}px`,
              },
            },
            '',
          ),
          div('.Timeline__sections-layer', [
            cursorSections && div('.Timeline__sections--cursor .Timeline__sections--cursor-x',
              { style: { left:  `${cursorSections.mx - 1 }px` } }, ''),
          ]),
        ]),
        div('.Timeline__events', [
          div('',  timelineEventsVDOM),
          div('',  timelineSectionsVDOM),
          state.eventCurrentlyCreated  && div('.Timeline__events-drawer', {
              style: {
                left: `${state.eventCurrentlyCreated.x - 9}px`,
                top: `${state.eventCurrentlyCreated.y - 9}px`,
                width: `${state.eventCurrentlyCreated.width}px`,
              },
            },
            '',
          ),
          div('.Timeline__events-layer', [
            cursorEvents && div('.Timeline__events--cursor .Timeline__events--cursor-x',
              { style: { left:  `${cursorEvents.mx - 1 }px` } }, ''),
            cursorEvents && div('.Timeline__events--cursor .Timeline__events--cursor-y',
              { style: { top: `${cursorEvents.my - 1 }px` } }, ''),
          ]),
        ]),
      ]),
    )

  return {
    DOM: vdom$,
    onion: xs.merge<Reducer<ITimelinePanelState>>(
      reducer$,
      timelineEventsSinks.onion,
      timelineSectionsSinks.onion,
    ),
  }
}

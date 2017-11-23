import { Reducer } from 'cycle-onionify'
import xs, { Stream } from 'xstream'

import { IAction } from 'timeline'
import { createTimelineEvent } from 'timeline/TimelineEvent'
import { createTimelineSection } from 'timeline/TimelineSection'
import { ITimelinePanelState } from './'

export const initialState: ITimelinePanelState = {
  selectedTimelineEvent: -1,
  timelineEvents: [],
  timelineSections: [],
}

export default function model(action$: Stream<IAction>): Stream<Reducer<ITimelinePanelState>> {

  const initReducer$ =  xs.of((prev: ITimelinePanelState) =>
    prev !== undefined ? prev : initialState) as Stream<Reducer<ITimelinePanelState>>

  const sectionMouseDownReducer$ = action$
    .filter(({ type }) => type === 'startCreateTimelineSection')
    .map(({ payload }) =>
      (state: ITimelinePanelState) =>
        ({
          ...state,
          sectionCurrentlyCreated: createTimelineSection(payload.x),
        }),
    ) as Stream<Reducer<ITimelinePanelState>>

  const sectionMouseMoveReducer$ = action$
    .filter(({ type }) => type === 'moveCreateTimelineSection')
    .map(({ payload }) =>
      (state: ITimelinePanelState) =>
        state.sectionCurrentlyCreated ? ({
          ...state,
          sectionCurrentlyCreated: {
            ...state.sectionCurrentlyCreated,
            width: Math.abs(payload.x - state.sectionCurrentlyCreated.x),
          },
        }) : state,
    ) as Stream<Reducer<ITimelinePanelState>>

  const sectionMouseUpReducer$ = action$
    .filter(({ type }) => type === 'endCreateTimelineSection')
    .map((_) =>
      (state: ITimelinePanelState) =>
        state.sectionCurrentlyCreated ? ({
          ...state,
          sectionCurrentlyCreated: undefined,
          timelineSections: state.timelineSections.concat(state.sectionCurrentlyCreated),
        }) : state,
    ) as Stream<Reducer<ITimelinePanelState>>

  const eventMouseDownReducer$ = action$
    .filter(({ type }) => type === 'startCreateTimelineEvent')
    .map(({ payload }) =>
      (state: ITimelinePanelState) =>
        ({
          ...state,
          eventCurrentlyCreated: createTimelineEvent(payload.x, payload.y),
        }),
    ) as Stream<Reducer<ITimelinePanelState>>

  const eventMouseMoveReducer$ = action$
    .filter(({ type }) => type === 'moveCreateTimelineEvent')
    .map(({ payload }) =>
      (state: ITimelinePanelState) =>
        state.eventCurrentlyCreated ? ({
          ...state,
          eventCurrentlyCreated: {
            ...state.eventCurrentlyCreated,
            width: Math.abs(payload.x - state.eventCurrentlyCreated.x) + 16, // 16 means for padding left/right
          },
        }) : state,
    ) as Stream<Reducer<ITimelinePanelState>>

  const eventMouseUpReducer$ = action$
    .filter(({ type }) => type === 'endCreateTimelineEvent')
    .map((_) =>
      (state: ITimelinePanelState) =>
        state.eventCurrentlyCreated ? ({
          ...state,
          eventCurrentlyCreated: undefined,
          timelineEvents: state.timelineEvents.concat(state.eventCurrentlyCreated),
        }) : state,
    ) as Stream<Reducer<ITimelinePanelState>>

  return xs.merge<Reducer<ITimelinePanelState>>(
    initReducer$,

    sectionMouseDownReducer$,
    sectionMouseMoveReducer$,
    sectionMouseUpReducer$,

    eventMouseDownReducer$,
    eventMouseMoveReducer$,
    eventMouseUpReducer$,
  )
}

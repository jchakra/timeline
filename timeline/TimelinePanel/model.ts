import { Reducer } from 'cycle-onionify'
import xs, { Stream } from 'xstream'

import { IAction } from 'timeline'
import { createTimelineEvent } from 'timeline/TimelineEvent'
import { ITimelinePanelState } from './'

export const initialState: ITimelinePanelState = {
  selectedTimelineEvent: -1,
  timelineEvents: [],
}

export default function model(action$: Stream<IAction>): Stream<Reducer<ITimelinePanelState>> {

  const initReducer$ =  xs.of((prev: ITimelinePanelState) =>
    prev !== undefined ? prev : initialState) as Stream<Reducer<ITimelinePanelState>>

  const timelineMouseDownReducer$ = action$
    .filter(({ type }) => type === 'startCreateTimelineEvent')
    .map(({ payload }) =>
      (state: ITimelinePanelState) =>
        ({
          ...state,
          currentlyCreated: createTimelineEvent(payload.x, payload.y),
        }),
    ) as Stream<Reducer<ITimelinePanelState>>

  const timelineMouseMoveReducer$ = action$
    .filter(({ type }) => type === 'moveCreateTimelineEvent')
    .map(({ payload }) =>
      (state: ITimelinePanelState) =>
        state.currentlyCreated ? ({
          ...state,
          currentlyCreated: {
            ...state.currentlyCreated,
            width: Math.abs(payload.x - state.currentlyCreated.x) + 16, // 16 means for padding left/right
          },
        }) : state,
    ) as Stream<Reducer<ITimelinePanelState>>

  const timelineMouseUpReducer$ = action$
    .filter(({ type }) => type === 'endCreateTimelineEvent')
    .map((_) =>
      (state: ITimelinePanelState) =>
        state.currentlyCreated ? ({
          ...state,
          currentlyCreated: undefined,
          timelineEvents: state.timelineEvents.concat(state.currentlyCreated),
        }) : state,
    ) as Stream<Reducer<ITimelinePanelState>>

  return xs.merge<Reducer<ITimelinePanelState>>(
    initReducer$,
    timelineMouseDownReducer$,
    timelineMouseMoveReducer$,
    timelineMouseUpReducer$,
  )
}

import { div } from '@cycle/dom'
import isolate from '@cycle/isolate'
import { Reducer } from 'cycle-onionify'
import xs, { Stream } from 'xstream'

import { ISinks, ISources } from 'timeline'
import DetailsPanel, { IDetailsPanelState } from 'timeline/DetailsPanel'
import Header from 'timeline/Header'
import TimelinePanel, { initialState as TPInitialState, ITimelinePanelState } from 'timeline/TimelinePanel'

export interface IAppState {
  timelinePanel: ITimelinePanelState
  detailsPanel?: IDetailsPanelState
}

const TimelinePanelLens = {
  get: (state: IAppState) => state.timelinePanel,
  set: (state: IAppState, childState: ITimelinePanelState) => ({
    detailsPanel: state.detailsPanel,
    timelinePanel: childState,
   }),
}

const DetailsPanelLens = {
  get: (state: IAppState) => state.timelinePanel.timelineEvents[state.timelinePanel.selectedTimelineEvent] || null,
  set: (state: IAppState, childState: IDetailsPanelState) =>
    childState ?
      ({
        ...state,
        timelinePanel: {
          ...state.timelinePanel,
          timelineEvents: state.timelinePanel.timelineEvents.map((tev) =>
            (tev.key === childState.key) ? { ...tev, ...childState } : tev),
        },
      }) :
      ({
        ...state,
        timelinePanel: {
          ...state.timelinePanel,
          selectedTimelineEvent: -1,
          timelineEvents: state.timelinePanel.timelineEvents.filter((tev) =>
            !state.timelinePanel.timelineEvents[state.timelinePanel.selectedTimelineEvent] ||
              tev.key !== state.timelinePanel.timelineEvents[state.timelinePanel.selectedTimelineEvent].key),
        },
      }),
}

export default function main(sources: ISources<IAppState>): ISinks<IAppState> {
  const headerSinks = Header()

  const timelinePanelSinks = isolate(TimelinePanel, { onion: TimelinePanelLens })(sources)
  const cardsPanelSinks = isolate(DetailsPanel, { onion: DetailsPanelLens })(sources)

  const vdom$ = xs.combine(headerSinks.DOM, cardsPanelSinks.DOM, timelinePanelSinks.DOM)
    .map(([headerDOM, cardsPanelDOM, timelinePanelDom]) =>
      div('.App', [headerDOM, cardsPanelDOM, timelinePanelDom]))

  const initReducer$ = xs.of((prev: IAppState): IAppState => (prev !== undefined ? prev : {
    timelinePanel: TPInitialState,
  })) as Stream<Reducer<IAppState>>

  const reducer$ = xs.merge<Reducer<IAppState>>(
    initReducer$,
    cardsPanelSinks.onion,
    timelinePanelSinks.onion,
  )

  return {
    DOM: vdom$,
    onion: reducer$,
  }
}

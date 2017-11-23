import { div } from '@cycle/dom'
import xs from 'xstream'

import { ISinks, ISources } from 'timeline'

export interface ITimelineSectionState {
  x: number
  key: string
  width?: number
  name?: string
}

export function createTimelineSection(x: number): ITimelineSectionState {
  return {
    key: +new Date() + '',
    width: 0,
    x,
  }
}

export default function TimelineSection(sources: ISources<ITimelineSectionState>): ISinks<ITimelineSectionState> {
  const state$ = sources.onion.state$

  const vdom$ = state$.map((state) =>
    div(
      '.TimelineSection',
      {
        style: {
          left: `${state.x}px`,
          width: `${state.width}px`,
        },
      },
      '',
    ),
  )

  return {
    DOM: vdom$,
    onion: xs.empty(),
  }
}

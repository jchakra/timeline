import { div } from '@cycle/dom'
import xs from 'xstream'

import { ISinks, ISources } from 'timeline'

export interface ICardState {
  x: number,
  y: number,
}

export default function Cards(sources: ISources<ICardState>): ISinks<ICardState> {
  const state$ = sources.onion.state$

  const vdom$ = state$.map((state) =>
    div(
      '.Card',
      { style: { left: `${state.x}px`, top: `${state.y}px` } },
      `x: ${state.x} and y: ${state.y}`,
    ),
  )

  return {
    DOM:  vdom$,
    Timeline: xs.empty(),
    onion: xs.empty(),
  }
}

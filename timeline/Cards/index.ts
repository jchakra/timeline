import { div } from '@cycle/dom'

import { ISinks, ISources } from 'timeline'

import xs from 'xstream'

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
    onion: xs.empty(),
  }
}

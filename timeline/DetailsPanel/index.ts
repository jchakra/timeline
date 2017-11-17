import { button, div, input } from '@cycle/dom'
import { Reducer } from 'cycle-onionify'
import xs from 'xstream'

import { ISinks, ISources } from 'timeline'

export type IDetailsPanelState = any

export default function DetailsPanel(sources: ISources<IDetailsPanelState>): ISinks<IDetailsPanelState> {

  const state$ = sources.onion.state$

  const initReducer$ = xs.of((prev: IDetailsPanelState) => prev !== undefined ? prev : { })

  const clickMeReducer$ = sources.DOM.select('.xx').events('click')
    .map(() => (state: IDetailsPanelState) => ({ ...state, x: 100, y: 50  }))

  const deleteReducer$ = sources.DOM.select('.DetailsPanel__actions--delete').events('click')
    .mapTo(() => void 0)

  const nameInputReducer$ = sources.DOM.select('.DetailsPanel__content--name').events('input')
    .map((event) =>
      (state: IDetailsPanelState) =>
        ({ ...state, description: { ...state.description, name: (event.target as HTMLInputElement).value } }))

  const colorInputReducer$ = sources.DOM.select('.DetailsPanel__content--color').events('input')
    .map((event) =>
      (state: IDetailsPanelState) =>
        ({ ...state, color: (event.target as HTMLInputElement).value } ))

  const reducer$ = xs.merge<Reducer<IDetailsPanelState>>(
    initReducer$,
    clickMeReducer$,
    deleteReducer$,
    nameInputReducer$,
    colorInputReducer$,
  )

  const vdom$ = xs.combine(state$)
    .map(([state]) =>
      div('#DetailsPanel', state !== null && [
        div('.DetailsPanel__actions', [
          button('.DetailsPanel__actions--delete', 'Delete'),
        ]),
        div('.DetailsPanel__content', [
          input('.DetailsPanel__content--name', { attrs: { placeholder: 'Name', value: state.description.name } }),
          input('.DetailsPanel__content--color', { attrs: { placeholder: 'Color', value: state.color } }),
        ]),
      ]),
    )

  return {
    DOM: vdom$,
    onion: reducer$,
  }
}

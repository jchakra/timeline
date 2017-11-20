import { button, div, i, input, span, textarea } from '@cycle/dom'
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
    .mapTo((_) => void 0)

  const nameInputReducer$ = sources.DOM.select('.DetailsPanel__general--name').events('input')
    .map((event) =>
      (state: IDetailsPanelState) =>
        ({ ...state, description: { ...state.description, name: (event.target as HTMLInputElement).value } }))

  const colorInputReducer$ = sources.DOM.select('.DetailsPanel__general--color').events('input')
    .map((event) =>
      (state: IDetailsPanelState) =>
        ({ ...state, color: (event.target as HTMLInputElement).value } ))

  const descriptionInputReducer$ = sources.DOM.select('.DetailsPanel__description--field').events('input')
    .map((event) =>
      (state: IDetailsPanelState) => console.log((event.target)) ||
        ({ ...state, description: { ...state.description, description: (event.target as HTMLInputElement).value } }))

  const reducer$ = xs.merge<Reducer<IDetailsPanelState | undefined>>(
    initReducer$,
    clickMeReducer$,
    deleteReducer$,
    nameInputReducer$,
    colorInputReducer$,
    descriptionInputReducer$,
  )

  const vdom$ = xs.combine(state$)
    .map(([state]) =>
      div('.DetailsPanel', state !== null && [
        div('.DetailsPanel__actions', [
          button('.DetailsPanel__actions--delete', [
            i('.material-icons', 'delete'),
            span('', ' Delete'),
          ]),
        ]),
        div('.DetailsPanel__general', [
          input('.DetailsPanel__general--name', { attrs: { placeholder: 'Name', value: state.description.name } }),
          input('.DetailsPanel__general--color', { attrs: { placeholder: 'Color', value: state.color } }),
        ]),
        div('.DetailsPanel__description', [
          textarea('.DetailsPanel__description--field', {
            attrs: {
              placeholder: 'Description',
            },
          }, [state.description.description]),
        ]),
      ]),
    )

  return {
    DOM: vdom$,
    onion: reducer$,
  }
}

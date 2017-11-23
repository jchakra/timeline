import xs, { Stream } from 'xstream'

import { IAction, ISources } from 'timeline'

export default function intent(sources: ISources<any>): Stream<IAction> {

  const sectionMouseDownAction$ = sources.DOM.select('.Timeline__sections').events('mousedown')
  .map((event) => ({
    payload: {
      x: event.offsetX,
    },
    type: 'startCreateTimelineSection',
  }))

  const sectionMouseMoveAction$ = sources.DOM.select('.Timeline__sections').events('mousemove')
    .map((event) => ({
      payload: {
        x: event.offsetX,
      },
      type: 'moveCreateTimelineSection',
    }))

  const sectionMouseUpAction$ = sources.DOM.select('.Timeline__sections').events('mouseup')
    .map((event) => ({
      payload: {
        x: event.offsetX,
      },
      type: 'endCreateTimelineSection',
    }))

  const eventMouseDownAction$ = sources.DOM.select('.Timeline__events').events('mousedown')
  .map((event) => ({
    payload: {
      x: event.offsetX,
      y: event.offsetY,
    },
    type: 'startCreateTimelineEvent',
  }))

  const eventMouseMoveAction$ = sources.DOM.select('.Timeline__events').events('mousemove')
    .map((event) => ({
      payload: {
        x: event.offsetX,
        y: event.offsetY,
      },
      type: 'moveCreateTimelineEvent',
    }))

  const eventMouseUpAction$ = sources.DOM.select('.Timeline__events').events('mouseup')
    .map((event) => ({
      payload: {
        x: event.offsetX,
        y: event.offsetY,
      },
      type: 'endCreateTimelineEvent',
    }))

  return xs.merge<IAction>(
    sectionMouseDownAction$,
    sectionMouseMoveAction$,
    sectionMouseUpAction$,

    eventMouseDownAction$,
    eventMouseMoveAction$,
    eventMouseUpAction$,
  )
}

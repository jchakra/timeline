import xs, { Stream } from 'xstream'

import { IAction, ISources } from 'timeline'

export default function intent(sources: ISources<any>): Stream<IAction> {
  const timelineMouseDownAction$ = sources.DOM.select('.Timeline').events('mousedown')
  .map((event) => ({
    payload: {
      x: event.offsetX,
      y: event.offsetY,
    },
    type: 'startCreateTimelineEvent',
  }))

  const timelineMouseMoveAction$ = sources.DOM.select('.Timeline').events('mousemove')
    .map((event) => ({
      payload: {
        x: event.offsetX,
        y: event.offsetY,
      },
      type: 'moveCreateTimelineEvent',
    }))

  const timelineMouseUpAction$ = sources.DOM.select('.Timeline').events('mouseup')
    .map((event) => ({
      payload: {
        x: event.offsetX,
        y: event.offsetY,
      },
      type: 'endCreateTimelineEvent',
    }))

  return xs.merge<IAction>(
    timelineMouseDownAction$,
    timelineMouseMoveAction$,
    timelineMouseUpAction$,
  )
}

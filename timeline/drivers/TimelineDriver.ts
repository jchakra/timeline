// import { select } from 'd3-selection'
import { Stream } from 'xstream'
import fromEvent from 'xstream/extra/fromEvent'

interface ITimelineSettings {
  start: {},
  end: {},
  cursorColor?: string
}

export type TimelineSource = {
  events: (name: string) => Stream<Event>,
}

export default function makeTimelineDriver(selector: string, settings: ITimelineSettings) {
  const timelineElt = document.querySelector(selector) as HTMLElement

  function createTimeline() {
    if (!timelineElt) {
      return
    }

    timelineElt.style.position = 'relative'
    timelineElt.style.cursor = 'crosshair'

    const timelineCursorLine = document.createElement('div')
    timelineCursorLine.setAttribute('id', 'timeline__cursor--line')
    timelineCursorLine.style.display = 'none'
    timelineCursorLine.style.position = 'absolute'
    timelineCursorLine.style.width = '2px'
    timelineCursorLine.style.height = '100%'
    timelineCursorLine.style.backgroundColor = settings.cursorColor || '#555'
    timelineCursorLine.style.pointerEvents = 'none'

    timelineElt.appendChild(timelineCursorLine)
  }

  function handleClick() {
    console.log('click')
  }

  function handleOver(data) {
    if (!timelineElt) {
      return
    }

    const cursorLine = timelineElt.querySelector('#timeline__cursor--line') as HTMLElement
    if (cursorLine) {
      cursorLine.style.display = 'block'
      cursorLine.style.left = `${data.payload.x - 1}px`
    }
  }

  return function timelineDriver(input$) {
    input$.take(1).addListener({
      complete: () => { return },
      error: (e) => { throw e },
      next: createTimeline,
    })

    input$.filter((event) => event.type === 'timelineClick').addListener({
      complete: () => { throw new Error('Timeline sink completed') },
      error: (e) => { throw e },
      next: handleClick,
    })

    input$.filter((event) => event.type === 'timelineOver').addListener({
      complete: () => { throw new Error('Timeline sink completed') },
      error: (e) => { throw e },
      next: handleOver,
    })

    return {
      events: (evName) => fromEvent(timelineElt as EventTarget, evName),
    }
  }
}

import { DOMSource, makeDOMDriver, VNode } from '@cycle/dom'
import { run, Sinks as Si, Sources as So } from '@cycle/run'
import onionify, { Reducer, StateSource } from 'cycle-onionify'
import { Stream } from 'xstream'

import main, { IAppState } from 'timeline/App'

export interface ISources<S = IAppState> extends So {
  DOM: DOMSource
  onion: StateSource<S>
}

export interface ISinks<S = IAppState> extends Si {
  DOM: Stream<VNode>
  onion: Stream<Reducer<S>>
}

const wrappedMain = onionify(main)

run(wrappedMain, {
  DOM: makeDOMDriver('#main-container'),
})

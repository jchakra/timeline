import { DOMSource, makeDOMDriver, VNode } from '@cycle/dom'
import { run } from '@cycle/run'
import onionify, { Reducer, StateSource } from 'cycle-onionify'
import { Stream } from 'xstream'

import main from 'timeline/App'

export interface ISources<S> {
  DOM: DOMSource
  onion: StateSource<S>
}

export interface ISinks<S> {
  DOM: Stream<VNode>
  onion: Stream<Reducer<S>>
}

const wrappedMain = onionify(main)

run(wrappedMain, {
  DOM: makeDOMDriver('#main-container'),
})

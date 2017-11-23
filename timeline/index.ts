import { DOMSource, makeDOMDriver, VNode } from '@cycle/dom'
import { run } from '@cycle/run'
// import storageDriver from '@cycle/storage'
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

export interface IAction {
  type: string,
  payload: any,
}

const wrappedMain = onionify(main)

run(wrappedMain, {
  DOM: makeDOMDriver('#main-container'),
  // storage: storageDriver,
})

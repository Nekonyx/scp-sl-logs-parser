import type { ServerLogModule, ServerLogType } from './constants'

export type LogLineMeta = {
  date: Date
  type: ServerLogType
  module: ServerLogModule
  content: string
}

export type LogFileMeta = {
  events: GameEvent[]
  gameVersion?: string
  startedAt?: Date
  endedAt?: Date
}

export type GameEvent = {
  date: Date
  meta: LogLineMeta
}

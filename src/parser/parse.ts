import { ServerLogType } from '../constants'
import { GameEvent } from '../types'
import { parseLineMeta } from './parse-line-meta'

export function parse(line: string): GameEvent {
  const meta = parseLineMeta(line)

  switch (meta.type) {
    case ServerLogType.ConnectionUpdate:
    case ServerLogType.RemoteAdminActivity_GameChanging:
    case ServerLogType.RemoteAdminActivity_Misc:
    case ServerLogType.KillLog:
    case ServerLogType.GameEvent:
    case ServerLogType.InternalMessage:
    case ServerLogType.RateLimit:
    case ServerLogType.Teamkill:
    case ServerLogType.Suicide:
    case ServerLogType.AdminChat:
      throw new Error('Not implemented')

    default:
      throw new Error(`Unknown log type ${meta.type}`)
  }
}

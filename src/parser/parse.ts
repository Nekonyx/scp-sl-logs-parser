import { ServerLogModule, ServerLogType } from '../constants'
import { parseLineMeta } from './parse-line-meta'

import type { GameEvent } from '../types'

/**
 * Parses a log line and returns a GameEvent object.
 *
 * @param line - The log line to parse.
 * @returns The parsed GameEvent object.
 * @throws Error if the log type is unknown.
 */
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
    case ServerLogType.AdminChat: {
      switch (meta.module) {
        case ServerLogModule.Warhead:
        case ServerLogModule.Networking:
        case ServerLogModule.ClassChange:
        case ServerLogModule.Permissions:
        case ServerLogModule.Administrative:
        case ServerLogModule.Logger:
        case ServerLogModule.DataAccess:
        case ServerLogModule.Detector: {
          throw new Error('Not implemented')
        }
      }
    }

    default: {
      throw new Error(`Unknown log type ${meta.type}`)
    }
  }
}

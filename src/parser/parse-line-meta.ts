import { SERVER_LOG_SEPARATOR, ServerLogModuleToEnum, ServerLogTypeToEnum } from '../constants'
import { LogLineMeta } from '../types'

export function parseLineMeta(line: string): LogLineMeta {
  const parts = line.split(SERVER_LOG_SEPARATOR)

  if (parts.length < 4) {
    throw new Error('Invalid log line format')
  }

  return {
    date: new Date(parts[0].trim()),
    type: ServerLogTypeToEnum[parts[1].trim()],
    module: ServerLogModuleToEnum[parts[2].trim()],
    content: parts.slice(3).join(SERVER_LOG_SEPARATOR).trim()
  }
}

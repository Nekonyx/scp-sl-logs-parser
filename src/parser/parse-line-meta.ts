import { SERVER_LOG_SEPARATOR, ServerLogModuleToEnum, ServerLogTypeToEnum } from '../constants'

import type { LogLineMeta } from '../types'

/**
 * Parses a log line and returns the metadata.
 *
 * @param line - The log line to parse.
 * @returns The parsed log line metadata.
 * @throws Error if the log line format is invalid.
 */
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

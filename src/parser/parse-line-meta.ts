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

/**
 * Extracts player account related data from a log line.
 *
 * @param logContent - The log line content.
 * @param extractTarget - Whether the target player will be extracted from log line.
 * E.g. killed by id, changed class of player id.
 *
 * @returns An object containing the player account related data.
 *
 * @example
 * const { userId, nickname, newContent, displayName } = extractPlayerData(
 *   'Jane Doe<color=855439>*</color> (John Doe) (76561199012345678@steam)'
 * )
 * {
 *   userId: '76561199012345678@steam',
 *   nickname: 'John Doe',
 *   newContent: '',
 *   displayName: 'Jane Doe'
 * }
 *
 * @example
 * const { userId, nickname, newContent, displayName } = extractPlayerData(
 *   'John Doe (76561199012345678@steam) other log related content'
 * )
 * {
 *   userId: '76561199012345678@steam',
 *   nickname: 'John Doe',
 *   newContent: ' other log related content',
 *   displayName: undefined
 * }
 */
export function extractPlayerData(
  logContent: string,
  extractTarget = false
): {
  displayName?: string
  userId: string
  nickname: string
} {
  // Possible content of logContent:
  // John Doe (76561199012345678@steam)
  // Jane Doe<color=855439>*</color> (John Doe) (76561199012345678@steam)
  const [combinedNickname, userId] = logContent
    .match(
      new RegExp(
        `${extractTarget ? '(?:(?:player|by|to player|to) )' : ''}${/(.*?) \(?(\w+@steam|northwood|discord|patreon)\)?/.source}`
      )
    )!
    .slice(1)

  // Possible content of combinedNickname:
  // John Doe
  // Jane Doe<color=#855439>*</color> (John Doe)
  const [displayName, nickname] = combinedNickname
    .match(/(?:(.*?)<color.*?color> \()?(.*)\)?/)!
    .slice(1) as [string | undefined, string]

  return {
    userId,
    // regex above captures trailing parenthesis if combinedNickname contains it
    nickname: nickname.replace(/\)$/, ''),
    displayName
  }
}

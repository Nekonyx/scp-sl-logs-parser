import { GameEventType, IS_NODE_ENV } from '../constants'
import { parse } from './parse'

import type { GameEvent, LogFileMeta } from '../types'

/**
 * Parses a log file and returns the metadata.
 *
 * @param file - The log file to parse. It can be a string, File object, ArrayBuffer, Uint8Array, or Buffer.
 * @returns A promise that resolves to the metadata of the log file.
 */
export async function parseFile(
  fileToParse: string | File | ArrayBuffer | Uint8Array | Buffer
): Promise<LogFileMeta> {
  const file = await readFile(fileToParse)

  const lines = file.trim().split('\n')
  const events: GameEvent[] = []

  let gameVersion: string | undefined
  let startedAt: Date | undefined
  let endedAt: Date | undefined

  let firstEventDate: Date | undefined
  let lastEventDate: Date | undefined

  for (const line of lines) {
    const event = parse(line)
    events.push(event)

    firstEventDate ??= event.date
    lastEventDate = event.date

    switch (event.type) {
      case GameEventType.LoggerStarted:
        gameVersion = event.gameVersion
        break

      case GameEventType.RoundStarted:
        startedAt = event.date
        break

      case GameEventType.RoundEnded:
        endedAt = event.date
        break
    }
  }

  return {
    events,
    gameVersion,
    startedAt: startedAt ?? firstEventDate,
    endedAt: endedAt ?? lastEventDate
  }
}

/**
 * Reads the contents of a file and returns it as a string.
 *
 * @param file - The file to read. It can be a string, a File object, an ArrayBuffer, a Uint8Array, or a Buffer.
 * @returns A promise that resolves to the contents of the file as a string.
 * @throws {Error} If the file type is not supported.
 */
async function readFile(file: string | File | ArrayBuffer | Uint8Array | Buffer): Promise<string> {
  if (typeof file === 'string') {
    return file
  }

  // Node.js implements some of the Web APIs, so we can use `file.text()` in both environments
  if (file instanceof File) {
    return file.text()
  }

  // Buffer.from is a cool thing
  if (IS_NODE_ENV) {
    // I don't want to alloc new buffer if it's already a buffer
    // prettier-ignore
    return Buffer.isBuffer(file) ? file.toString('utf8') : Buffer.from(file).toString('utf8')
  }

  // ArrayBuffer and Uint8Array is a Web-standard, so we can use TextDecoder
  if (file instanceof ArrayBuffer || file instanceof Uint8Array) {
    return new TextDecoder().decode(file)
  }

  // This part of code is unreachable unless you're passing some weird stuff
  throw new Error('Unsupported file type')
}

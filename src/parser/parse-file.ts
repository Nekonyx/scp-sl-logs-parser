import { GameEvent, LogFileMeta } from '../types'
import { parse } from './parse'

export async function parseFile(file: string | File | Buffer): Promise<LogFileMeta> {
  file =
    typeof file === 'string'
      ? file
      : file instanceof File
      ? await file.text()
      : file.toString('utf8')

  const lines = file.trim().split('\n')
  const events: GameEvent[] = []

  let gameVersion: string | undefined
  let startedAt: Date | undefined
  let endedAt: Date | undefined

  for (const line of lines) {
    const event = parse(line)
    events.push(event)
  }

  return {
    events,
    gameVersion,
    startedAt,
    endedAt
  }
}

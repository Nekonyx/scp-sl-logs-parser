import { ServerLogModule, ServerLogType } from '../constants'
import { parseLineMeta } from './parse-line-meta'

import { GameEventType } from '../constants'
import type { GameEvent, PlayerKilledGameEvent } from '../types'

function extractPlayerData(logContent: string): {
  displayName?: string
  userId: string
  nickname: string
  newContent: string
} {
  // John Doe (76561199012345678@steam)
  // Jane Doe<color=855439>*</color> (John Doe) (76561199012345678@steam)
  const displayNameRegex =
    /(.*?)<color.*?color> \((.*?)\) \((\w+@steam|northwood|discord|patreon)\)/g
  const nicknameRegex = /(.*?) \((\w+@steam|northwood|discord|patreon)\)/

  if (logContent.includes('<color=')) {
    const [displayName, nickname, userId] = logContent.match(displayNameRegex)!
    return { userId, nickname, newContent: logContent.replace(displayName, '') }
  }

  const [nickname, userId] = logContent.match(nicknameRegex)!
  return { userId, nickname, newContent: logContent.replace(nicknameRegex, '') }
}

/**
 * Parses a log line and returns a GameEvent object.
 *
 * @param line - The log line to parse.
 * @returns The parsed GameEvent object.
 * @throws Error if the log type is unknown.
 */
export function parse(line: string): GameEvent {
  const meta = parseLineMeta(line)
  const { content } = meta

  switch (meta.type) {
    case ServerLogType.ConnectionUpdate: {
      // 76561199012345678@steam preauthenticated from endpoint 127.0.0.1:9777.
      // 76561199012345678@steam authenticated from endpoint 127.0.0.1:55889. Player ID assigned: 2. Auth token serial number: qwerty123
      // Nickname of 76561199012345678@steam is now John Doe.
      // John Doe 76561199012345678@steam disconnected from IP address 127.0.0.1. Last class: Spectator (Spectator)
      // Player (CharacterClassManager)) connected from IP 127.0.0.1 sent Do Not Track signal.
      // John Doe (76561199012345678@steam) has been assigned to group Administrator.
      if (content.includes('preauthenticated')) {
        const [userId, ip, port] = content.match(
          /(\w+?@steam|northwood|discord|patreon).*((?:\d{1,3}\.?){4}):(\d+)/g
        )!

        return {
          type: GameEventType.PlayerPreauthenticated,
          meta,
          player: {
            userId,
            ip,
            port: Number(port),
            endpoint: `${ip}:${port}`
          }
        }
      }

      if (content.includes('Auth token serial number')) {
        const [userId, ip, port] = content.match(
          /(\w+?@steam|northwood|discord|patreon).*((?:\d{1,3}\.?){4}):(\d+)/g
        )!
        const [playerId, authToken] = content.match(
          /Player ID assigned: (\d+). Auth token serial number: (\w+)/g
        )!

        return {
          type: GameEventType.PlayerAuthenticated,
          meta: meta,
          player: {
            id: Number(playerId),
            userId,
            ip,
            port: Number(port),
            endpoint: `${ip}:${port}`
          },
          authTokenSerialNumber: authToken
        }
      }

      if (content.startsWith('Nickname of')) {
        const [userId, nickname] = content.match(
          /(\w+?@steam|northwood|discord|patreon) is now (.*?)\./g
        )!

        return {
          type: GameEventType.PlayerJoined,
          meta,
          player: {
            userId,
            nickname
          }
        }
      }

      if (content.includes('disconnected')) {
        const { userId, nickname, newContent, displayName } = extractPlayerData(content)
        const [playerClass] = newContent.match(/Last class: (.*?) \(/)!

        return {
          type: GameEventType.PlayerLeft,
          meta,
          player: {
            userId,
            nickname,
            displayName,
            class: playerClass
          }
        }
      }

      if (content.includes('sent Do Not Track signal')) {
        const [ip] = content.match(/from IP (.*?) sent/)!

        return {
          type: GameEventType.PlayerSentDoNotTrackSignal,
          meta,
          ip
        }
      }

      if (content.includes('assigned to group')) {
        const { userId, nickname, displayName } = extractPlayerData(content)
        const [group] = content.match(/to group (.*?)\./)!

        return {
          type: GameEventType.PlayerAssignedToGroup,
          meta,
          player: {
            userId,
            nickname,
            displayName,
            group
          }
        }
      }

      return {
        type: GameEventType.WarheadDetonated,
        meta
      }
    }
    case ServerLogType.RemoteAdminActivity_GameChanging:
    case ServerLogType.RemoteAdminActivity_Misc:
    case ServerLogType.KillLog:
    // {
    //   // John Doe (76561199012345678@steam) playing as Class-D Personnel has been killed by John Doe (76561199012345678@steam) using SCP-173 playing as SCP-173.
    //   // Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam) playing as Chaos Insurgency Repressor has been killed by Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam) using LOGICER playing as Nine-Tailed Fox Captain.
    // return {
    //   type: GameEventType.WarheadDetonated,

    // }
    // }
    case ServerLogType.GameEvent: {
      // Round has been started.
      // Round finished! Anomalies: 0 | Chaos: 0 | Facility Forces: 6 | D escaped percentage: 0 | S escaped percentage: : 0
      // John Doe (76561199012345678@steam) spawned as Class-D Personnel.
      // Class Picker Result: ClassD | Scp93953 | FacilityGuard | ClassD | Scientist | FacilityGuard | ClassD | Scp049 | Scientist | FacilityGuard | ClassD | ClassD | FacilityGuard | ClassD | Scp173 | ClassD | FacilityGuard | Scientist | ClassD | Scp079 | ClassD | ClassD | ClassD |
      // Random classes have been assigned by DCP.
      // Player John Doe (76561199012345678@steam) respawned as NtfSergeant.
      // RespawnManager has successfully spawned 11 players as NineTailedFox!
      // Countdown started.
      // Warhead detonated.

      if (content === 'Round has been started.') {
        return {
          type: GameEventType.RoundStarted,
          meta: meta
        }
      }

      if (content.startsWith('Round finished!')) {
        const [
          anomalies,
          chaos,
          facilityForces,
          dClassEscapePercentage,
          scientistsEscapePercentage
        ] = content.match(/\d+/g)!.map(Number)

        return {
          type: GameEventType.RoundEnded,
          meta,
          anomalies,
          chaos,
          facilityForces,
          dClassEscapePercentage,
          scientistsEscapePercentage
        }
      }

      if (content.includes('spawned as')) {
        const [nickname, userId, playerClass] = content.match(
          /(.*?) \((\w+@steam|northwood|discord|patreon)\) spawned as (.*?)\./g
        )!

        return {
          type: GameEventType.PlayerSpawned,
          meta,
          player: {
            userId,
            nickname,
            class: playerClass
          }
        }
      }

      if (content.startsWith('Class Picker Result')) {
        const classes = content
          .split(':')[1]
          .split('|')
          .map((playerClass) => playerClass.trim())

        return {
          type: GameEventType.ClassPickerResult,
          meta,
          classes
        }
      }

      if (content.startsWith('Random classes have been assigned')) {
        return {
          type: GameEventType.RandomClassesAssigned,
          meta
        }
      }

      if (content.includes('respawned as')) {
        const [nickname, userId, playerClass] = content.match(
          /Player (.*?) \((\w+@steam|northwood|discord|patreon)\) respawned as (.*?)\./g
        )!

        return {
          type: GameEventType.PlayerRespawned,
          meta,
          player: {
            userId,
            nickname,
            class: playerClass
          }
        }
      }

      if (content.startsWith('RespawnManager has successfully spawned')) {
        // ? В RespawnManagerSpawnedPlayers не прописано поле класса
        const [count, playerClass] = content.match(/spawned (\d+) players as (.*?)\!/g)!

        return {
          type: GameEventType.RespawnManagerSpawnedPlayers,
          meta,
          count: Number(count)
        }
      }

      if (content === 'Countdown started.') {
        return {
          type: GameEventType.WarheadCountdownStarted,
          meta
        }
      }

      if (content === 'Warhead detonated.') {
        return {
          type: GameEventType.WarheadDetonated,
          meta
        }
      }

      throw new Error(`Couldn't parse content of log of type ${meta.type}: ${content}`)
    }
    case ServerLogType.InternalMessage: {
      // Started logging. Game version: 11.0.0, private beta: NO.
      const [gameVersion, isPrivateBeta] = meta.content.match(
        /Game version: ([\d.]+?), private beta: (NO|YES)./g
      )!

      return {
        type: GameEventType.LoggerStarted,
        meta,
        gameVersion,
        isPrivateBeta: isPrivateBeta === 'YES'
      }
    }
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

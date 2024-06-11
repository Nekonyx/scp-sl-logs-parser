import { ServerLogModule, ServerLogType } from '../constants'
import { parseLineMeta } from './parse-line-meta'

import { GameEventType } from '../constants'
import type { GameEvent } from '../types'

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
  const nicknameRegex = /(.*?) \((\w+@steam|northwood|discord|patreon)\)/g

  if (logContent.includes('<color=')) {
    const [displayName, nickname, userId] = logContent.match(displayNameRegex)!
    return {
      displayName,
      userId,
      nickname,
      newContent: logContent.replace(new RegExp(displayNameRegex, ''), '')
    }
  }

  const [nickname, userId] = logContent.match(nicknameRegex)!
  return { userId, nickname, newContent: logContent.replace(new RegExp(nicknameRegex, ''), '') }
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
    // biome-ignore lint/suspicious/noFallthroughSwitchClause:
    case ServerLogType.RemoteAdminActivity_GameChanging: {
      // John Doe (76561199012345678@steam) banned player scp (76561199012345678@steam). Ban duration: 30. Reason: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum quis tempor nisl. Aliquam aliquam, nisi sed hendrerit pretium, odio felis sollicitudin tellus, ac ultricies ante nisl id sem. Ut molestie purus eu lorem sagittis suscipit.
      // John Doe (76561199012345678@steam) teleported themself to player John Doe (76561199012345678@steam).
      // John Doe (76561199012345678@steam) teleported themself to player Jane Doe<color=855439>*</color> (John Doe) (76561199012345678@steam).
      // John Doe (76561199012345678@steam) started a cassie announcement: Attention . SCP 0 4 9 has escaped the facility . . .g2 Report to nearby Site . ready .
      // John Doe (76561199012345678@steam) started a silent cassie announcement: pitch_0.8 .g4 . . .g4 . . .g4 . . . warning jam_010_2 pitch_0.9 . all .g6 personel . facility light system .g2 pitch_0.7 jam_001_3 .g2 .g2 jam_50_2 pitch_0.8 critical pitch_0.6 .g2 .g1 .g2 pitch_0.8 jam_3_4 detected . . .g1 .g5 light jam_5_3 may . b .g1 unstable pitch_0.8 jam_4_4 .g4 . . jam_4_4 .g4 . . jam_4_4 .g4 .
      // John Doe (76561199012345678@steam) brought player John Doe (76561199012345678@steam).
      // LCZ decontamination has been disabled by detonation of the Alpha Warhead.
      // John Doe (76561199012345678@steam)opened door **.
      // John Doe (76561199012345678@steam)closed door **.
      // John Doe (76561199012345678@steam)unlocked door **.
      // John Doe (76561199012345678@steam)locked door **.
      // John Doe (76561199012345678@steam) enabled lobby lock.
      // John Doe (76561199012345678@steam) disabled lobby lock.
      // John Doe (76561199012345678@steam) enabled round lock.
      // John Doe (76561199012345678@steam) disabled round lock.
      // John Doe (76561199012345678@steam) muted player Jane Doe<color=855439>*</color> (John Doe) (76561199012345678@steam).
      // John Doe (76561199012345678@steam) unmuted player Jane Doe<color=855439>*</color> (John Doe) (76561199012345678@steam).
      // John Doe (76561199012345678@steam) revoked an intercom mute of player Jane Doe<color=855439>*</color> (John Doe) (76561199012345678@steam).
      // John Doe (76561199012345678@steam) gave Adrenaline to John Doe (76561199012345678@steam).
      // John Doe (76561199012345678@steam) set nickname of player 42 (John Doe) to "Jane Doe".
      switch (meta.module) {
        case ServerLogModule.Warhead:
        case ServerLogModule.Networking:
        case ServerLogModule.ClassChange:
        case ServerLogModule.Permissions:
        case ServerLogModule.Administrative: {
          if (content.includes('banned')) {
            const adminData = extractPlayerData(content)
            const playerData = extractPlayerData(adminData.newContent)
            const [_, duration, reason] = content.match(
              /Ban duration\: (\d+)\. Reason: ([\s\S]+)$/
            )!
            return {
              type: GameEventType.PlayerBanned,
              meta,
              administrator: {
                userId: adminData.userId,
                nickname: adminData.nickname,
                displayName: adminData.displayName
              },
              player: {
                userId: playerData.userId,
                nickname: playerData.nickname,
                displayName: playerData.displayName
              },
              duration: Number(duration),
              reason
            }
          }
          throw new Error('Not implemented')
        }
        case ServerLogModule.Logger:
        case ServerLogModule.DataAccess:
        case ServerLogModule.Detector: {
          throw new Error('Not implemented')
        }
      }
    }

    case ServerLogType.RemoteAdminActivity_Misc:
    // case ServerLogType.KillLog:
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
    // biome-ignore lint/suspicious/noFallthroughSwitchClause:
    case ServerLogType.AdminChat: {
      // John Doe (76561199012345678@steam) banned player scp (76561199012345678@steam). Ban duration: 30. Reason: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum quis tempor nisl. Aliquam aliquam, nisi sed hendrerit pretium, odio felis sollicitudin tellus, ac ultricies ante nisl id sem. Ut molestie purus eu lorem sagittis suscipit.
      // John Doe (76561199012345678@steam) teleported themself to player John Doe (76561199012345678@steam).
      // John Doe (76561199012345678@steam) teleported themself to player Jane Doe<color=855439>*</color> (John Doe) (76561199012345678@steam).
      // John Doe (76561199012345678@steam) started a cassie announcement: Attention . SCP 0 4 9 has escaped the facility . . .g2 Report to nearby Site . ready .
      // John Doe (76561199012345678@steam) started a silent cassie announcement: pitch_0.8 .g4 . . .g4 . . .g4 . . . warning jam_010_2 pitch_0.9 . all .g6 personel . facility light system .g2 pitch_0.7 jam_001_3 .g2 .g2 jam_50_2 pitch_0.8 critical pitch_0.6 .g2 .g1 .g2 pitch_0.8 jam_3_4 detected . . .g1 .g5 light jam_5_3 may . b .g1 unstable pitch_0.8 jam_4_4 .g4 . . jam_4_4 .g4 . . jam_4_4 .g4 .
      // John Doe (76561199012345678@steam) brought player John Doe (76561199012345678@steam).
      // LCZ decontamination has been disabled by detonation of the Alpha Warhead.
      // John Doe (76561199012345678@steam)opened door **.
      // John Doe (76561199012345678@steam)closed door **.
      // John Doe (76561199012345678@steam)unlocked door **.
      // John Doe (76561199012345678@steam)locked door **.
      // John Doe (76561199012345678@steam) enabled lobby lock.
      // John Doe (76561199012345678@steam) disabled lobby lock.
      // John Doe (76561199012345678@steam) enabled round lock.
      // John Doe (76561199012345678@steam) disabled round lock.
      // John Doe (76561199012345678@steam) muted player Jane Doe<color=855439>*</color> (John Doe) (76561199012345678@steam).
      // John Doe (76561199012345678@steam) unmuted player Jane Doe<color=855439>*</color> (John Doe) (76561199012345678@steam).
      // John Doe (76561199012345678@steam) revoked an intercom mute of player Jane Doe<color=855439>*</color> (John Doe) (76561199012345678@steam).
      // John Doe (76561199012345678@steam) gave Adrenaline to John Doe (76561199012345678@steam).
      // John Doe (76561199012345678@steam) set nickname of player 42 (John Doe) to "Jane Doe".
      switch (meta.module) {
        case ServerLogModule.Warhead:
        case ServerLogModule.Networking:
        case ServerLogModule.ClassChange:
        case ServerLogModule.Permissions:
        case ServerLogModule.Administrative: {
          if (content.includes('banned')) {
            const adminData = extractPlayerData(content)
            const playerData = extractPlayerData(adminData.newContent)
            const [duration, reason] = content.match(/Ban duration: (\d+). Reason: ([\s\S]+)$/g)!

            return {
              type: GameEventType.PlayerBanned,
              meta,
              administrator: {
                userId: adminData.userId,
                nickname: adminData.nickname,
                displayName: adminData.displayName
              },
              player: {
                userId: playerData.userId,
                nickname: playerData.nickname,
                displayName: playerData.displayName
              },
              duration: Number(duration),
              reason
            }
          }
          throw new Error('Not implemented')
        }
        case ServerLogModule.Logger:
        case ServerLogModule.DataAccess:
        case ServerLogModule.Detector: {
          throw new Error('Not implemented')
        }
      }
    }

    default: {
      throw new Error(`Unknown log type ${meta.type} with module ${meta.module}`)
    }
  }
}

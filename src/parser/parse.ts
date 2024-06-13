import { ServerLogModule, ServerLogType } from '../constants'
import { extractPlayerData, parseLineMeta } from './parse-line-meta'

import { GameEventType } from '../constants'
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
        const [userId, ip, port] = content
          .match(/^(.*?) preauthenticated from endpoint (.*?):(\d+)/)!
          .slice(1)

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
        const [userId, ip, port, playerId, authToken] = content
          .match(
            /^(.*?) authenticated from endpoint (.*?):(\d+)\. Player ID assigned: (\d+). Auth token serial number: (\w+)/
          )!
          .slice(1)

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
        const [userId, nickname] = content.match(/^Nickname of (.*) is now (.*)\./)!.slice(1)

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
        const { userId, nickname, displayName } = extractPlayerData(content)
        const [playerClass] = content.match(/Last class: (.*?) \(/)!.slice(1)

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
        const [ip] = content.match(/from IP (.*?) sent/)!.slice(1)

        return {
          type: GameEventType.PlayerSentDoNotTrackSignal,
          meta,
          ip
        }
      }

      if (content.includes('assigned to group')) {
        const { userId, nickname, displayName } = extractPlayerData(content)
        const [group] = content.match(/to group (.*?)\./)!.slice(1)

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

      throw new Error('Not implemented')
    }
    case ServerLogType.RemoteAdminActivity_GameChanging: {
      switch (meta.module) {
        case ServerLogModule.ClassChange: {
          // John Doe (76561199012345678@steam) changed class of player John Doe (76561199012345678@steam) to Spectator.

          if (content.includes('changed class of player')) {
            const administrator = extractPlayerData(content)
            const player = extractPlayerData(content, true)
            const [playerClass] = content.match(/to (.*?)\./)!.slice(1)

            return {
              type: GameEventType.PlayerChangedClass,
              meta,
              administrator,
              player: {
                ...player,
                class: playerClass
              }
            }
          }

          throw new Error('Not implemented')
        }
        case ServerLogModule.Administrative: {
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

          if (content.includes('banned')) {
            const administrator = extractPlayerData(content)
            const player = extractPlayerData(content, true)
            const [duration, reason] = content
              .match(/Ban duration\: (\d+)\. Reason: ([\s\S]+)/)!
              .slice(1)

            return {
              type: GameEventType.PlayerBanned,
              meta,
              administrator,
              player,
              duration: Number(duration),
              reason
            }
          }

          if (content.includes('teleported themself to')) {
            const administrator = extractPlayerData(content)
            const player = extractPlayerData(content, true)

            return {
              type: GameEventType.PlayerTeleported,
              meta,
              administrator,
              player
            }
          }

          if (content.includes('cassie announcement')) {
            const administrator = extractPlayerData(content)
            const [message] = content.match(/cassie announcement: (.*) \.$/)!.slice(1)

            return {
              type: GameEventType.CassieAnnouncementStarted,
              meta,
              administrator,
              isSilent: message.includes('silent cassie announcement: '),
              message
            }
          }

          if (content.includes('brought player')) {
            const administrator = extractPlayerData(content)
            const player = extractPlayerData(content, true)

            return {
              type: GameEventType.PlayerBrought,
              meta,
              administrator,
              player
            }
          }

          if (content.includes('LCZ decontamination has been disabled')) {
            return {
              type: GameEventType.DecontaminationDisabled,
              meta
            }
          }

          if (content.match(/\)( )?(opened|closed|unlocked|locked) door/)) {
            const administrator = extractPlayerData(content)
            const [action, door] = content
              .match(/(opened|closed|unlocked|locked) door (.*)\./)!
              .slice(1) as ['opened' | 'closed' | 'unlocked' | 'locked', string]
            const actionsTypes: Record<
              typeof action,
              | GameEventType.DoorOpened
              | GameEventType.DoorClosed
              | GameEventType.DoorUnlocked
              | GameEventType.DoorLocked
            > = {
              opened: GameEventType.DoorOpened,
              closed: GameEventType.DoorClosed,
              unlocked: GameEventType.DoorUnlocked,
              locked: GameEventType.DoorLocked
            }

            return {
              type: actionsTypes[action],
              meta,
              administrator,
              door
            }
          }

          if (content.endsWith('lobby lock.')) {
            const administrator = extractPlayerData(content)
            const enabled = content.endsWith('enabled lobby lock.')

            return {
              type: enabled ? GameEventType.LobbyLockEnabled : GameEventType.LobbyLockDisabled,
              meta,
              administrator
            }
          }

          if (content.endsWith('round lock.')) {
            const administrator = extractPlayerData(content)
            const enabled = content.endsWith('enabled round lock.')

            return {
              type: enabled ? GameEventType.RoundLockEnabled : GameEventType.RoundLockDisabled,
              meta,
              administrator
            }
          }

          if (content.includes('muted player')) {
            const administrator = extractPlayerData(content)
            const player = extractPlayerData(content, true)
            const unmuted = content.includes('unmuted player')

            return {
              type: unmuted ? GameEventType.PlayerUnmuted : GameEventType.PlayerMuted,
              meta,
              administrator,
              player
            }
          }

          if (content.includes('revoked an intercom mute')) {
            const administrator = extractPlayerData(content)
            const player = extractPlayerData(content, true)

            return {
              type: GameEventType.PlayerIntercomMuteRevoked,
              meta,
              administrator,
              player
            }
          }

          if (content.match(/\) gave .* to .*/)) {
            const administrator = extractPlayerData(content)
            const player = extractPlayerData(content, true)
            const [item] = content.match(/gave (.*) to/)!.slice(1)

            return {
              type: GameEventType.PlayerGotItem,
              meta,
              administrator,
              player,
              item
            }
          }

          if (content.includes('set nickname of player')) {
            const administrator = extractPlayerData(content)
            const [oldNickname, newNickname] = content
              .match(/of player .* \((.*)\) to "(.*)"./)!
              .slice(1)

            return {
              type: GameEventType.PlayerSetNickname,
              meta,
              administrator,
              player: {
                nickname: oldNickname
              },
              nickname: newNickname
            }
          }

          throw new Error('Not implemented')
        }
        default: {
          throw new Error('Not implemented')
        }
      }
    }
    case ServerLogType.KillLog: {
      // John Doe (76561199012345678@steam) playing as Class-D Personnel has been killed by John Doe (76561199012345678@steam) using SCP-173 playing as SCP-173.
      // Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam) playing as Chaos Insurgency Repressor has been killed by Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam) using LOGICER playing as Nine-Tailed Fox Captain.

      if (content.includes('has been killed by')) {
        // ? В PlayerKilledGameEvent не прописано поле weapon
        const victim = extractPlayerData(content)
        const killer = extractPlayerData(content, true)
        const [victimClass, killerClass] = content
          .match(/playing as (.*) has been killed by .* playing as (.*)\./)!
          .slice(1)

        return {
          type: GameEventType.PlayerKilled,
          meta,
          killer: {
            ...killer,
            class: killerClass
          },
          victim: {
            ...victim,
            class: victimClass
          }
        }
      }

      throw new Error('Not implemented')
    }
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

      if (content.includes(' spawned as')) {
        const { userId, nickname } = extractPlayerData(content)
        const [playerClass] = content.match(/ spawned as (.*?)\./)!.slice(1)

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
          .filter(Boolean)

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
        const { userId, nickname } = extractPlayerData(content.replace('Player ', ''))
        const [playerClass] = content.match(/respawned as (.*?)\./)!.slice(1)

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
        // ? В RespawnManagerSpawnedPlayersGameEvent не прописано поле класса
        const [count] = content.match(/spawned (\d+) players as (.*)\!/)!.slice(1)

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

      throw new Error('Not implemented')
    }
    case ServerLogType.InternalMessage: {
      // Started logging. Game version: 11.0.0, private beta: NO.

      if (content.startsWith('Started logging.')) {
        const [gameVersion, isPrivateBeta] = meta.content
          .match(/Game version: ([\d.]+?), private beta: (NO|YES)./)!
          .slice(1)

        return {
          type: GameEventType.LoggerStarted,
          meta,
          gameVersion,
          isPrivateBeta: isPrivateBeta === 'YES'
        }
      }

      throw new Error('Not implemented')
    }
    case ServerLogType.RateLimit: {
      // Incoming connection from endpoint 76561199012345678@steam (127.0.0.1:12207) rejected due to exceeding the rate limit.
      // Incoming connection from endpoint null (127.0.0.1:12207) rejected due to exceeding the rate limit.

      if (content.includes('rejected due to exceeding the rate limit')) {
        const [userId, endpoint] = content.match(/from endpoint (.*?) \((.*?)\)/)!.slice(1)

        return {
          type: GameEventType.RateLimitExceeded,
          meta,
          player: {
            userId: userId.includes('@') ? userId.trim() : undefined,
            endpoint
          }
        }
      }

      throw new Error('Not implemented')
    }
    case ServerLogType.AdminChat: {
      switch (meta.module) {
        // case ServerLogModule.Warhead:
        // case ServerLogModule.Networking:
        // case ServerLogModule.ClassChange:
        // case ServerLogModule.Permissions:
        // case ServerLogModule.Administrative:
        // case ServerLogModule.Logger:
        // case ServerLogModule.DataAccess:
        // case ServerLogModule.Detector: {
        //   throw new Error('Not implemented')
        // }
        default: {
          throw new Error('Not implemented')
        }
      }
    }

    default: {
      throw new Error(`Unknown log type ${meta.type} with module ${meta.module}`)
    }
  }
}

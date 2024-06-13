import { describe, expect, test } from 'vitest'

import { GameEventType, ServerLogModule, ServerLogType } from '../constants'
import type {
  CassieAnnouncementStartedGameEvent,
  ClassPickerResultGameEvent,
  DecontaminationDisabledGameEvent,
  DoorClosedGameEvent,
  DoorLockedGameEvent,
  DoorOpenedGameEvent,
  DoorUnlockedGameEvent,
  LobbyLockDisabledGameEvent,
  LobbyLockEnabledGameEvent,
  LoggerStartedGameEvent,
  PlayerAssignedToGroupGameEvent,
  PlayerAuthenticatedGameEvent,
  PlayerBannedGameEvent,
  PlayerBroughtGameEvent,
  PlayerChangedClassGameEvent,
  PlayerGotItemGameEvent,
  PlayerIntercomMuteRevokedGameEvent,
  PlayerJoinedGameEvent,
  PlayerKilledGameEvent,
  PlayerLeftGameEvent,
  PlayerMutedGameEvent,
  PlayerPreauthenticatedGameEvent,
  PlayerRespawnedGameEvent,
  PlayerSentDoNotTrackSignalGameEvent,
  PlayerSetNicknameGameEvent,
  PlayerSpawnedGameEvent,
  PlayerTeleportedGameEvent,
  PlayerUnmutedGameEvent,
  RandomClassesAssignedGameEvent,
  RateLimitExceededGameEvent,
  RespawnManagerSpawnedPlayersGameEvent,
  RoundEndedGameEvent,
  RoundLockDisabledGameEvent,
  RoundLockEnabledGameEvent,
  RoundStartedGameEvent,
  WarheadCountdownStartedGameEvent,
  WarheadDetonatedGameEvent
} from '../types'
import { parse } from './parse'

const john = {
  userId: '76561199012345678@steam',
  nickname: 'John Doe',
  displayName: 'Jane Doe'
}

const constantLines = {
  loggerStart:
    '2021-11-15 14:34:14.981 +03:00 | Internal            | Logger         | Started logging. Game version: 11.0.0, private beta: NO.',
  roundStart:
    '2021-11-15 16:00:21.504 +03:00 | Game Event          | Logger         | Round has been started.',
  roundFinish:
    '2021-11-15 16:15:59.553 +03:00 | Game Event          | Logger         | Round finished! Anomalies: 0 | Chaos: 0 | Facility Forces: 6 | D escaped percentage: 0 | S escaped percentage: : 0',
  preAuth:
    '2021-11-15 14:34:26.195 +03:00 | Connection update   | Networking     | 76561199012345678@steam preauthenticated from endpoint 127.0.0.1:9777.',
  authed:
    '2021-11-15 14:34:33.485 +03:00 | Connection update   | Networking     | 76561199012345678@steam authenticated from endpoint 127.0.0.1:55889. Player ID assigned: 2. Auth token serial number: qwerty123',
  playerJoin:
    '2021-11-15 14:34:34.214 +03:00 | Connection update   | Networking     | Nickname of 76561199012345678@steam is now John Doe.',
  disconnect:
    '2021-11-15 16:09:20.619 +03:00 | Connection update   | Networking     | John Doe 76561199012345678@steam disconnected from IP address 127.0.0.1. Last class: Spectator (Spectator)',
  doNotTrack:
    '2021-11-15 21:14:47.293 +03:00 | Connection update   | Networking     | Player (CharacterClassManager)) connected from IP 127.0.0.1 sent Do Not Track signal.',
  groupAssign:
    '2021-11-15 15:59:40.235 +03:00 | Connection update   | Permissions    | John Doe (76561199012345678@steam) has been assigned to group Administrator.',
  playerSpawned:
    '2021-11-15 16:00:22.506 +03:00 | Game Event          | Class change   | John Doe (76561199012345678@steam) spawned as Class-D Personnel.',
  classPicker:
    '2021-11-15 16:00:22.556 +03:00 | Game Event          | Logger         | Class Picker Result: ClassD | Scp93953 | FacilityGuard | ClassD | Scientist | FacilityGuard | ClassD | Scp049 | Scientist | FacilityGuard | ClassD | ClassD | FacilityGuard | ClassD | Scp173 | ClassD | FacilityGuard | Scientist | ClassD | Scp079 | ClassD | ClassD | ClassD |',
  randomClasses:
    '2021-11-15 16:17:09.657 +03:00 | Game Event          | Logger         | Random classes have been assigned by DCP.',
  playerClassChange:
    '2021-11-15 16:00:27.861 +03:00 | Remote Admin        | Class change   | John Doe (76561199012345678@steam) changed class of player John Doe (76561199012345678@steam) to Spectator.',
  playerKilled:
    '2021-11-15 16:02:03.624 +03:00 | Kill                | Class change   | John Doe (76561199012345678@steam) playing as Class-D Personnel has been killed by John Doe (76561199012345678@steam) using SCP-173 playing as SCP-173.',
  playerKilledDisplayName:
    '2021-11-15 21:07:31.715 +03:00 | Kill                | Class change   | Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam) playing as Chaos Insurgency Repressor has been killed by Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam) using LOGICER playing as Nine-Tailed Fox Captain.',
  banned:
    '2021-11-15 16:02:23.853 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) banned player scp (76561199012345678@steam). Ban duration: 30. Reason: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum quis tempor nisl. Aliquam aliquam, nisi sed hendrerit pretium, odio felis sollicitudin tellus, ac ultricies ante nisl id sem. Ut molestie purus eu lorem sagittis suscipit.',
  teleported:
    '2021-11-15 16:07:38.158 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) teleported themself to player John Doe (76561199012345678@steam).',
  teleportedDisplayName:
    '2021-11-15 21:07:49.681 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) teleported themself to player Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam).',
  cassie:
    '2021-11-15 16:08:44.129 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) started a cassie announcement: Attention . SCP 0 4 9 has escaped the facility . . .g2 Report to nearby Site . ready .',
  silentCassie:
    '2021-11-15 20:36:33.070 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) started a silent cassie announcement: pitch_0.8 .g4 . . .g4 . . .g4 . . . warning jam_010_2 pitch_0.9 . all .g6 personel . facility light system .g2 pitch_0.7 jam_001_3 .g2 .g2 jam_50_2 pitch_0.8 critical pitch_0.6 .g2 .g1 .g2 pitch_0.8 jam_3_4 detected . . .g1 .g5 light jam_5_3 may . b .g1 unstable pitch_0.8 jam_4_4 .g4 . . jam_4_4 .g4 . . jam_4_4 .g4 .',
  respawned:
    '2021-11-15 16:09:13.171 +03:00 | Game Event          | Class change   | Player John Doe (76561199012345678@steam) respawned as NtfSergeant.',
  respawnManager:
    '2021-11-15 16:09:13.183 +03:00 | Game Event          | Class change   | RespawnManager has successfully spawned 11 players as NineTailedFox!',
  bringPlayer:
    '2021-11-15 16:13:09.185 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) brought player John Doe (76561199012345678@steam).',
  countdownStarted:
    '2021-11-15 16:47:07.502 +03:00 | Game Event          | Warhead        | Countdown started.',
  warheadDetonated:
    '2021-11-15 16:49:18.528 +03:00 | Game Event          | Warhead        | Warhead detonated.',
  decontaminationDisabled:
    '2021-11-15 16:49:18.528 +03:00 | Remote Admin        | Administrative | LCZ decontamination has been disabled by detonation of the Alpha Warhead.',
  rateLimit:
    '2021-11-15 18:53:00.159 +03:00 | Rate Limit          | Networking     | Incoming connection from endpoint 76561199012345678@steam (127.0.0.1:12207) rejected due to exceeding the rate limit.',
  rateLimitNoUserId:
    '2021-11-15 18:53:00.159 +03:00 | Rate Limit          | Networking     | Incoming connection from endpoint null (127.0.0.1:12207) rejected due to exceeding the rate limit.',
  doorOpen:
    '2021-11-15 19:06:11.128 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam)opened door **.',
  doorClose:
    '2021-11-15 19:06:31.086 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam)closed door **.',
  doorUnlock:
    '2021-11-15 19:07:49.381 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam)unlocked door **.',
  doorLock:
    '2021-11-15 19:06:32.954 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam)locked door **.',
  lobbyLock:
    '2021-11-15 19:06:11.972 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) enabled lobby lock.',
  lobbyUnlock:
    '2021-11-15 19:07:04.681 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) disabled lobby lock.',
  roundLock:
    '2021-11-15 19:06:11.325 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) enabled round lock.',
  roundUnlock:
    '2021-11-15 21:08:39.746 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) disabled round lock.',
  muted:
    '2021-11-15 21:08:23.506 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) muted player Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam).',
  unmuted:
    '2021-11-15 21:08:36.644 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) unmuted player Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam).',
  muteRevoked:
    '2021-11-15 21:08:34.311 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) revoked an intercom mute of player Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam).',
  itemGive:
    '2021-11-15 20:09:34.481 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) gave Adrenaline to John Doe (76561199012345678@steam).',
  nicknameSet:
    '2021-11-15 20:11:41.783 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) set nickname of player 42 (John Doe) to "Jane Doe".'
}

describe('parse single log lines', () => {
  describe('type: internal', () => {
    // Logger         | Started logging. Game version: 11.0.0, private beta: NO.

    test('module: logger | logger start', () => {
      const {
        type,
        meta: { type: logType, module },
        gameVersion,
        isPrivateBeta
      } = parse(constantLines.loggerStart) as LoggerStartedGameEvent

      expect(type).toBe(GameEventType.LoggerStarted)
      expect(logType).toBe(ServerLogType.InternalMessage)
      expect(module).toBe(ServerLogModule.Logger)

      expect(gameVersion).toBe('11.0.0')
      expect(isPrivateBeta).toBe(false)
    })
  })

  describe('type: game event', () => {
    // Logger         | Round has been started.
    // Logger         | Round finished! Anomalies: 0 | Chaos: 0 | Facility Forces: 6 | D escaped percentage: 0 | S escaped percentage: : 0
    // Class change   | John Doe (76561199012345678@steam) spawned as Class-D Personnel.
    // Logger         | Class Picker Result: ClassD | Scp93953 | FacilityGuard | ClassD | Scientist | FacilityGuard | ClassD | Scp049 | Scientist | FacilityGuard | ClassD | ClassD | FacilityGuard | ClassD | Scp173 | ClassD | FacilityGuard | Scientist | ClassD | Scp079 | ClassD | ClassD | ClassD |
    // Logger         | Random classes have been assigned by DCP.
    // Class change   | Player John Doe (76561199012345678@steam) respawned as NtfSergeant.
    // Class change   | RespawnManager has successfully spawned 11 players as NineTailedFox!
    // Warhead        | Countdown started.
    // Warhead        | Warhead detonated.

    test('module: logger | round start', () => {
      const {
        type,
        meta: { type: logType, module: logModule }
      } = parse(constantLines.roundStart) as RoundStartedGameEvent

      expect(type).toBe(GameEventType.RoundStarted)
      expect(logType).toBe(ServerLogType.GameEvent)
      expect(logModule).toBe(ServerLogModule.Logger)
    })

    test('module: logger | round finish', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        anomalies,
        chaos,
        facilityForces,
        dClassEscapePercentage,
        scientistsEscapePercentage
      } = parse(constantLines.roundFinish) as RoundEndedGameEvent

      expect(type).toBe(GameEventType.RoundEnded)
      expect(logType).toBe(ServerLogType.GameEvent)
      expect(logModule).toBe(ServerLogModule.Logger)

      expect(anomalies).toBe(0)
      expect(chaos).toBe(0)
      expect(facilityForces).toBe(6)
      expect(dClassEscapePercentage).toBe(0)
      expect(scientistsEscapePercentage).toBe(0)
    })

    test('module: class change | player spawned', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        player: { userId, nickname, displayName, class: playerClass }
      } = parse(constantLines.playerSpawned) as PlayerSpawnedGameEvent

      expect(type).toBe(GameEventType.PlayerSpawned)
      expect(logType).toBe(ServerLogType.GameEvent)
      expect(logModule).toBe(ServerLogModule.ClassChange)

      expect(userId).toBe(john.userId)
      expect(nickname).toBe(john.nickname)
      expect(displayName).toBe(undefined)
      expect(playerClass).toBe('Class-D Personnel')
    })

    test('module: logger | class picker result', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        classes
      } = parse(constantLines.classPicker) as ClassPickerResultGameEvent

      expect(type).toBe(GameEventType.ClassPickerResult)
      expect(logType).toBe(ServerLogType.GameEvent)
      expect(logModule).toBe(ServerLogModule.Logger)

      // biome-ignore format:
      expect(classes).toStrictEqual( [
        'ClassD',        'Scp93953',
        'FacilityGuard', 'ClassD',
        'Scientist',     'FacilityGuard',
        'ClassD',        'Scp049',
        'Scientist',     'FacilityGuard',
        'ClassD',        'ClassD',
        'FacilityGuard', 'ClassD',
        'Scp173',        'ClassD',
        'FacilityGuard', 'Scientist',
        'ClassD',        'Scp079',
        'ClassD',        'ClassD',
        'ClassD'
      ])
    })

    test('module: logger | random classes assigned', () => {
      const {
        type,
        meta: { type: logType, module: logModule }
      } = parse(constantLines.randomClasses) as RandomClassesAssignedGameEvent

      expect(type).toBe(GameEventType.RandomClassesAssigned)
      expect(logType).toBe(ServerLogType.GameEvent)
      expect(logModule).toBe(ServerLogModule.Logger)
    })

    test('module: class change | player respawned', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        player: { userId, nickname, displayName, class: playerClass }
      } = parse(constantLines.respawned) as PlayerRespawnedGameEvent

      expect(type).toBe(GameEventType.PlayerRespawned)
      expect(logType).toBe(ServerLogType.GameEvent)
      expect(logModule).toBe(ServerLogModule.ClassChange)

      expect(userId).toBe(john.userId)
      expect(nickname).toBe(john.nickname)
      expect(displayName).toBe(undefined)
      expect(playerClass).toBe('NtfSergeant')
    })

    test('module: class change | respawn manager', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        count
      } = parse(constantLines.respawnManager) as RespawnManagerSpawnedPlayersGameEvent

      expect(type).toBe(GameEventType.RespawnManagerSpawnedPlayers)
      expect(logType).toBe(ServerLogType.GameEvent)
      expect(logModule).toBe(ServerLogModule.ClassChange)

      expect(count).toBe(11)
    })

    test('module: warhead | countdown start', () => {
      const {
        type,
        meta: { type: logType, module: logModule }
      } = parse(constantLines.countdownStarted) as WarheadCountdownStartedGameEvent

      expect(type).toBe(GameEventType.WarheadCountdownStarted)
      expect(logType).toBe(ServerLogType.GameEvent)
      expect(logModule).toBe(ServerLogModule.Warhead)
    })

    test('module: warhead | warhead detonated', () => {
      const {
        type,
        meta: { type: logType, module: logModule }
      } = parse(constantLines.warheadDetonated) as WarheadDetonatedGameEvent

      expect(type).toBe(GameEventType.WarheadDetonated)
      expect(logType).toBe(ServerLogType.GameEvent)
      expect(logModule).toBe(ServerLogModule.Warhead)
    })
  })

  describe('type: connection update', () => {
    // Networking     | 76561199012345678@steam preauthenticated from endpoint 127.0.0.1:9777.
    // Networking     | 76561199012345678@steam authenticated from endpoint 127.0.0.1:55889. Player ID assigned: 2. Auth token serial number: qwerty123
    // Networking     | Nickname of 76561199012345678@steam is now John Doe.
    // Networking     | John Doe 76561199012345678@steam disconnected from IP address 127.0.0.1. Last class: Spectator (Spectator)
    // Networking     | Player (CharacterClassManager)) connected from IP 127.0.0.1 sent Do Not Track signal.
    // Permissions    | John Doe (76561199012345678@steam) has been assigned to group Administrator.

    test('module: networking | preauthenticated', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        player: { userId, ip, port, endpoint }
      } = parse(constantLines.preAuth) as PlayerPreauthenticatedGameEvent

      expect(type).toBe(GameEventType.PlayerPreauthenticated)
      expect(logType).toBe(ServerLogType.ConnectionUpdate)
      expect(logModule).toBe(ServerLogModule.Networking)

      expect(userId).toBe(john.userId)
      expect(ip).toBe('127.0.0.1')
      expect(port).toBe(9777)
      expect(endpoint).toBe('127.0.0.1:9777')
    })

    test('module: networking | authenticated', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        player: { id, userId, ip, port, endpoint }
      } = parse(constantLines.authed) as PlayerAuthenticatedGameEvent

      expect(type).toBe(GameEventType.PlayerAuthenticated)
      expect(logType).toBe(ServerLogType.ConnectionUpdate)
      expect(logModule).toBe(ServerLogModule.Networking)

      expect(id).toBe(2)
      expect(userId).toBe(john.userId)
      expect(ip).toBe('127.0.0.1')
      expect(port).toBe(55889)
      expect(endpoint).toBe('127.0.0.1:55889')
    })

    test('module: networking | player joined', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        player: { userId, nickname }
      } = parse(constantLines.playerJoin) as PlayerJoinedGameEvent

      expect(type).toBe(GameEventType.PlayerJoined)
      expect(logType).toBe(ServerLogType.ConnectionUpdate)
      expect(logModule).toBe(ServerLogModule.Networking)

      expect(userId).toBe(john.userId)
      expect(nickname).toBe(john.nickname)
    })

    test('module: networking | player left', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        player: { userId, nickname, displayName, class: playerClass }
      } = parse(constantLines.disconnect) as PlayerLeftGameEvent

      expect(type).toBe(GameEventType.PlayerLeft)
      expect(logType).toBe(ServerLogType.ConnectionUpdate)
      expect(logModule).toBe(ServerLogModule.Networking)

      expect(userId).toBe(john.userId)
      expect(nickname).toBe(john.nickname)
      expect(displayName).toBe(undefined)
      expect(playerClass).toBe('Spectator')
    })

    test('module: networking | do not track signal', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        ip
      } = parse(constantLines.doNotTrack) as PlayerSentDoNotTrackSignalGameEvent

      expect(type).toBe(GameEventType.PlayerSentDoNotTrackSignal)
      expect(logType).toBe(ServerLogType.ConnectionUpdate)
      expect(logModule).toBe(ServerLogModule.Networking)

      expect(ip).toBe('127.0.0.1')
    })

    test('module: permissions | player assigned to group', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        player
      } = parse(constantLines.groupAssign) as PlayerAssignedToGroupGameEvent

      expect(type).toBe(GameEventType.PlayerAssignedToGroup)
      expect(logType).toBe(ServerLogType.ConnectionUpdate)
      expect(logModule).toBe(ServerLogModule.Permissions)

      expect(player.userId).toBe(john.userId)
      expect(player.nickname).toBe(john.nickname)
      expect(player.displayName).toBe(undefined)

      expect(player.group).toBe('Administrator')
    })
  })

  describe('type: remote admin', () => {
    // Class change   | John Doe (76561199012345678@steam) changed class of player John Doe (76561199012345678@steam) to Spectator.
    // Administrative | John Doe (76561199012345678@steam) banned player scp (76561199012345678@steam). Ban duration: 30. Reason: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum quis tempor nisl. Aliquam aliquam, nisi sed hendrerit pretium, odio felis sollicitudin tellus, ac ultricies ante nisl id sem. Ut molestie purus eu lorem sagittis suscipit.
    // Administrative | John Doe (76561199012345678@steam) teleported themself to player John Doe (76561199012345678@steam).
    // Administrative | John Doe (76561199012345678@steam) teleported themself to player Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam).
    // Administrative | John Doe (76561199012345678@steam) started a cassie announcement: Attention . SCP 0 4 9 has escaped the facility . . .g2 Report to nearby Site . ready .
    // Administrative | John Doe (76561199012345678@steam) started a silent cassie announcement: pitch_0.8 .g4 . . .g4 . . .g4 . . . warning jam_010_2 pitch_0.9 . all .g6 personel . facility light system .g2 pitch_0.7 jam_001_3 .g2 .g2 jam_50_2 pitch_0.8 critical pitch_0.6 .g2 .g1 .g2 pitch_0.8 jam_3_4 detected . . .g1 .g5 light jam_5_3 may . b .g1 unstable pitch_0.8 jam_4_4 .g4 . . jam_4_4 .g4 . . jam_4_4 .g4 .
    // Administrative | John Doe (76561199012345678@steam) brought player John Doe (76561199012345678@steam).
    // Administrative | LCZ decontamination has been disabled by detonation of the Alpha Warhead.
    // Administrative | John Doe (76561199012345678@steam)opened door **.
    // Administrative | John Doe (76561199012345678@steam)closed door **.
    // Administrative | John Doe (76561199012345678@steam)unlocked door **.
    // Administrative | John Doe (76561199012345678@steam)locked door **.
    // Administrative | John Doe (76561199012345678@steam) enabled lobby lock.
    // Administrative | John Doe (76561199012345678@steam) disabled lobby lock.
    // Administrative | John Doe (76561199012345678@steam) enabled round lock.
    // Administrative | John Doe (76561199012345678@steam) disabled round lock.
    // Administrative | John Doe (76561199012345678@steam) muted player Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam).
    // Administrative | John Doe (76561199012345678@steam) unmuted player Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam).
    // Administrative | John Doe (76561199012345678@steam) revoked an intercom mute of player Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam).
    // Administrative | John Doe (76561199012345678@steam) gave Adrenaline to John Doe (76561199012345678@steam).
    // Administrative | John Doe (76561199012345678@steam) set nickname of player 42 (John Doe) to "Jane Doe".

    test('module: class change | set class of the player', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator,
        player
      } = parse(constantLines.playerClassChange) as PlayerChangedClassGameEvent

      expect(type).toBe(GameEventType.PlayerChangedClass)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.ClassChange)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)

      expect(player.userId).toBe(john.userId)
      expect(player.nickname).toBe(john.nickname)
      expect(player.displayName).toBe(undefined)
      expect(player.class).toBe('Spectator')
    })

    test('module: administrative | ban', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator,
        player,
        duration,
        reason
      } = parse(constantLines.banned) as PlayerBannedGameEvent

      expect(type).toBe(GameEventType.PlayerBanned)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)

      expect(player.userId).toBe(john.userId)
      expect(player.nickname).toBe('scp')
      expect(player.displayName).toBe(undefined)

      expect(duration).toBe(30)
      expect(reason).toBe(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum quis tempor nisl. Aliquam aliquam, nisi sed hendrerit pretium, odio felis sollicitudin tellus, ac ultricies ante nisl id sem. Ut molestie purus eu lorem sagittis suscipit.'
      )
    })

    test('module: administrative | teleport', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator,
        player
      } = parse(constantLines.teleported) as PlayerTeleportedGameEvent

      expect(type).toBe(GameEventType.PlayerTeleported)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)

      expect(player.userId).toBe(john.userId)
      expect(player.nickname).toBe(john.nickname)
      expect(player.displayName).toBe(undefined)
    })

    test('module: administrative | teleport with display name', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator,
        player
      } = parse(constantLines.teleportedDisplayName) as PlayerTeleportedGameEvent

      expect(type).toBe(GameEventType.PlayerTeleported)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)

      expect(player.userId).toBe(john.userId)
      expect(player.nickname).toBe(john.nickname)
      expect(player.displayName).toBe(john.displayName)
    })

    test('module: administrative | start cassie announcement', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator,
        isSilent,
        message
      } = parse(constantLines.cassie) as CassieAnnouncementStartedGameEvent

      expect(type).toBe(GameEventType.CassieAnnouncementStarted)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)

      expect(isSilent).toBe(false)
      expect(message).toBe(
        'Attention . SCP 0 4 9 has escaped the facility . . .g2 Report to nearby Site . ready'
      )
    })

    test('module: administrative | start silent cassie announcement', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator,
        isSilent,
        message
      } = parse(constantLines.silentCassie) as CassieAnnouncementStartedGameEvent

      expect(type).toBe(GameEventType.CassieAnnouncementStarted)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)

      expect(isSilent).toBe(false)
      expect(message).toBe(
        'pitch_0.8 .g4 . . .g4 . . .g4 . . . warning jam_010_2 pitch_0.9 . all .g6 personel . facility light system .g2 pitch_0.7 jam_001_3 .g2 .g2 jam_50_2 pitch_0.8 critical pitch_0.6 .g2 .g1 .g2 pitch_0.8 jam_3_4 detected . . .g1 .g5 light jam_5_3 may . b .g1 unstable pitch_0.8 jam_4_4 .g4 . . jam_4_4 .g4 . . jam_4_4 .g4'
      )
    })

    test('module: administrative | bring player', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator,
        player
      } = parse(constantLines.bringPlayer) as PlayerBroughtGameEvent

      expect(type).toBe(GameEventType.PlayerBrought)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)

      expect(player.userId).toBe(john.userId)
      expect(player.nickname).toBe(john.nickname)
      expect(player.displayName).toBe(undefined)
    })

    test('module: administrative | deactivation of LCZ decontamination', () => {
      const {
        type,
        meta: { type: logType, module: logModule }
      } = parse(constantLines.decontaminationDisabled) as DecontaminationDisabledGameEvent

      expect(type).toBe(GameEventType.DecontaminationDisabled)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)
    })

    test('module: administrative | door open', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator,
        door
      } = parse(constantLines.doorOpen) as DoorOpenedGameEvent

      expect(type).toBe(GameEventType.DoorOpened)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)

      expect(door).toBe('**')
    })

    test('module: administrative | door close', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator,
        door
      } = parse(constantLines.doorClose) as DoorClosedGameEvent

      expect(type).toBe(GameEventType.DoorClosed)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)

      expect(door).toBe('**')
    })

    test('module: administrative | door unlock', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator,
        door
      } = parse(constantLines.doorUnlock) as DoorUnlockedGameEvent

      expect(type).toBe(GameEventType.DoorUnlocked)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)

      expect(door).toBe('**')
    })

    test('module: administrative | door lock', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator,
        door
      } = parse(constantLines.doorLock) as DoorLockedGameEvent

      expect(type).toBe(GameEventType.DoorLocked)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)

      expect(door).toBe('**')
    })

    test('module: administrative | lobby lock', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator
      } = parse(constantLines.lobbyLock) as LobbyLockEnabledGameEvent

      expect(type).toBe(GameEventType.LobbyLockEnabled)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)
    })

    test('module: administrative | lobby unlock', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator
      } = parse(constantLines.lobbyUnlock) as LobbyLockDisabledGameEvent

      expect(type).toBe(GameEventType.LobbyLockDisabled)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)
    })

    test('module: administrative | round lock', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator
      } = parse(constantLines.roundLock) as RoundLockEnabledGameEvent

      expect(type).toBe(GameEventType.RoundLockEnabled)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)
    })

    test('module: administrative | round unlock', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator
      } = parse(constantLines.roundUnlock) as RoundLockDisabledGameEvent

      expect(type).toBe(GameEventType.RoundLockDisabled)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)
    })

    test('module: administrative | mute', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator,
        player
      } = parse(constantLines.muted) as PlayerMutedGameEvent

      expect(type).toBe(GameEventType.PlayerMuted)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)

      expect(player.userId).toBe(john.userId)
      expect(player.nickname).toBe(john.nickname)
      expect(player.displayName).toBe(john.displayName)
    })

    test('module: administrative | unmute', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator,
        player
      } = parse(constantLines.unmuted) as PlayerUnmutedGameEvent

      expect(type).toBe(GameEventType.PlayerUnmuted)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)

      expect(player.userId).toBe(john.userId)
      expect(player.nickname).toBe(john.nickname)
      expect(player.displayName).toBe(john.displayName)
    })

    test('module: administrative | intercom mute revoke', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator,
        player
      } = parse(constantLines.muteRevoked) as PlayerIntercomMuteRevokedGameEvent

      expect(type).toBe(GameEventType.PlayerIntercomMuteRevoked)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)

      expect(player.userId).toBe(john.userId)
      expect(player.nickname).toBe(john.nickname)
      expect(player.displayName).toBe(john.displayName)
    })

    test('module: administrative | item give', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator,
        player,
        item
      } = parse(constantLines.itemGive) as PlayerGotItemGameEvent

      expect(type).toBe(GameEventType.PlayerGotItem)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)

      expect(player.userId).toBe(john.userId)
      expect(player.nickname).toBe(john.nickname)
      expect(player.displayName).toBe(undefined)

      expect(item).toBe('Adrenaline')
    })

    test('module: administrative | nickname set', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        administrator,
        player,
        nickname
      } = parse(constantLines.nicknameSet) as PlayerSetNicknameGameEvent

      expect(type).toBe(GameEventType.PlayerSetNickname)
      expect(logType).toBe(ServerLogType.RemoteAdminActivity_GameChanging)
      expect(logModule).toBe(ServerLogModule.Administrative)

      expect(administrator.userId).toBe(john.userId)
      expect(administrator.nickname).toBe(john.nickname)
      expect(administrator.displayName).toBe(undefined)

      expect(player.nickname).toBe(john.nickname)
      expect(player.displayName).toBe(undefined)

      expect(nickname).toBe('Jane Doe')
    })
  })

  describe('type: kill', () => {
    // Class change   | John Doe (76561199012345678@steam) playing as Class-D Personnel has been killed by John Doe (76561199012345678@steam) using SCP-173 playing as SCP-173.
    // Class change   | Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam) playing as Chaos Insurgency Repressor has been killed by Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam) using LOGICER playing as Nine-Tailed Fox Captain.

    test('module: class change | kill', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        killer,
        victim
      } = parse(constantLines.playerKilled) as PlayerKilledGameEvent

      expect(type).toBe(GameEventType.PlayerKilled)
      expect(logType).toBe(ServerLogType.KillLog)
      expect(logModule).toBe(ServerLogModule.ClassChange)

      expect(killer.userId).toBe(john.userId)
      expect(killer.nickname).toBe(john.nickname)
      expect(killer.displayName).toBe(undefined)
      expect(killer.class).toBe('SCP-173')

      expect(victim.userId).toBe(john.userId)
      expect(victim.nickname).toBe(john.nickname)
      expect(victim.displayName).toBe(undefined)
      expect(victim.class).toBe('Class-D Personnel')
    })

    test('module: class change | kill with display name', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        killer,
        victim
      } = parse(constantLines.playerKilledDisplayName) as PlayerKilledGameEvent

      expect(type).toBe(GameEventType.PlayerKilled)
      expect(logType).toBe(ServerLogType.KillLog)
      expect(logModule).toBe(ServerLogModule.ClassChange)

      expect(killer.userId).toBe(john.userId)
      expect(killer.nickname).toBe(john.nickname)
      expect(killer.displayName).toBe(john.displayName)
      expect(killer.class).toBe('Nine-Tailed Fox Captain')

      expect(victim.userId).toBe(john.userId)
      expect(victim.nickname).toBe(john.nickname)
      expect(victim.displayName).toBe(john.displayName)
      expect(victim.class).toBe('Chaos Insurgency Repressor')
    })
  })

  describe('type: rate limit', () => {
    // Networking     | Incoming connection from endpoint 76561199012345678@steam (127.0.0.1:12207) rejected due to exceeding the rate limit.
    // Networking     | Incoming connection from endpoint null (127.0.0.1:12207) rejected due to exceeding the rate limit.

    test('module: networking | rate limit', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        player: { endpoint, userId }
      } = parse(constantLines.rateLimit) as RateLimitExceededGameEvent

      expect(type).toBe(GameEventType.RateLimitExceeded)
      expect(logType).toBe(ServerLogType.RateLimit)
      expect(logModule).toBe(ServerLogModule.Networking)

      expect(userId).toBe(john.userId)
      expect(endpoint).toBe('127.0.0.1:12207')
    })

    test('module: networking | rate limit no userId', () => {
      const {
        type,
        meta: { type: logType, module: logModule },
        player: { endpoint, userId }
      } = parse(constantLines.rateLimitNoUserId) as RateLimitExceededGameEvent

      expect(type).toBe(GameEventType.RateLimitExceeded)
      expect(logType).toBe(ServerLogType.RateLimit)
      expect(logModule).toBe(ServerLogModule.Networking)

      expect(userId).toBe(undefined)
      expect(endpoint).toBe('127.0.0.1:12207')
    })
  })
})

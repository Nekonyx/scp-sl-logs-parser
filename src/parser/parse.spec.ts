import { GameEventType, ServerLogModule, ServerLogType } from '../constants'
import type {
  CassieAnnouncementStartedGameEvent,
  ClassPickerResultGameEvent,
  DecontaminationDisabledGameEvent,
  DoorClosedGameEvent,
  DoorLockedGameEvent,
  DoorOpenedGameEvent,
  DoorUnlockedGameEvent,
  GameEvent,
  LobbyLockDisabledGameEvent,
  LobbyLockEnabledGameEvent,
  LogFileMeta,
  LogLineMeta,
  LoggerStartedGameEvent,
  Player,
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
  nickname:
    '2021-11-15 14:34:34.214 +03:00 | Connection update   | Networking     | Nickname of 76561199012345678@steam is now John Doe.',
  disconnect:
    '2021-11-15 16:09:20.619 +03:00 | Connection update   | Networking     | John Doe 76561199012345678@steam disconnected from IP address 127.0.0.1. Last class: Spectator (Spectator)',
  connect:
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
  playerBrought:
    '2021-11-15 16:13:09.185 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) brought player John Doe (76561199012345678@steam).',
  countdownStarted:
    '2021-11-15 16:47:07.502 +03:00 | Game Event          | Warhead        | Countdown started.',
  warheadDetonated:
    '2021-11-15 16:49:18.528 +03:00 | Game Event          | Warhead        | Warhead detonated.',
  decontaminationDisabled:
    '2021-11-15 16:49:18.528 +03:00 | Remote Admin        | Administrative | LCZ decontamination has been disabled by detonation of the Alpha Warhead.',
  rateLimit:
    '2021-11-15 18:53:00.159 +03:00 | Rate Limit          | Networking     | Incoming connection from endpoint 76561199012345678@steam (127.0.0.1:12207) rejected due to exceeding the rate limit.',
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
  })
})

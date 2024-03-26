import type { GameEventType, ServerLogModule, ServerLogType } from './constants'

export type LogLineMeta = {
  date: Date
  type: ServerLogType
  module: ServerLogModule
  content: string
}

export type LogFileMeta = {
  events: GameEvent[]
  gameVersion?: string
  startedAt?: Date
  endedAt?: Date
}

/** Player */
export type Player = {
  /**
   * ID
   * @example 1
   */
  id: number
  /**
   * User ID
   * @example '76561199212345678@steam', 'zabszk@northwood'
   */
  userId: string
  /**
   * Nickname
   * @example 'Player'
   */
  nickname: string
  /**
   * Display name (if set)
   * @example 'Player'
   */
  displayName?: string
  /**
   * IP address
   * @example '127.0.0.1'
   */
  ip: string
  /**
   * Port
   * @example 7777
   */
  port: number
  /**
   * Endpoint (pair of ip and port)
   * @example '127.0.0.1:7777'
   */
  endpoint: string
  /**
   * Class
   * @example 'Class-D Personnel'
   */
  class: string
  /**
   * Group
   * @example 'Administrator'
   */
  group: string
}

export type LoggerStartedGameEvent = {
  type: GameEventType.LoggerStarted
  date: Date
  meta: LogLineMeta
  gameVersion: string
  isPrivateBeta: boolean
}

export type RoundStartedGameEvent = {
  type: GameEventType.RoundStarted
  date: Date
  meta: LogLineMeta
}

export type RoundEndedGameEvent = {
  type: GameEventType.RoundEnded
  date: Date
  meta: LogLineMeta
  anomalies: number
  chaos: number
  facilityForces: number
  dClassEscapePercentage: number
  scientistsEscapePercentage: number
}

export type PlayerPreauthenticatedGameEvent = {
  type: GameEventType.PlayerPreauthenticated
  date: Date
  meta: LogLineMeta
  player: Pick<Player, 'userId' | 'ip' | 'port' | 'endpoint'>
}

export type PlayerAuthenticatedGameEvent = {
  type: GameEventType.PlayerAuthenticated
  date: Date
  meta: LogLineMeta
  player: Pick<Player, 'id' | 'userId' | 'ip' | 'port' | 'endpoint'>
  authTokenSerialNumber: string
}

export type PlayerJoinedGameEvent = {
  type: GameEventType.PlayerJoined
  date: Date
  meta: LogLineMeta
  player: Pick<Player, 'userId' | 'nickname'>
}

export type PlayerLeftGameEvent = {
  type: GameEventType.PlayerLeft
  date: Date
  meta: LogLineMeta
  player: Pick<Player, 'userId' | 'nickname' | 'displayName' | 'class'>
}

export type PlayerSentDoNotTrackSignalGameEvent = {
  type: GameEventType.PlayerSentDoNotTrackSignal
  date: Date
  meta: LogLineMeta
  ip: string
}

export type PlayerAssignedToGroupGameEvent = {
  type: GameEventType.PlayerAssignedToGroup
  date: Date
  meta: LogLineMeta
  player: Pick<Player, 'userId' | 'nickname' | 'displayName' | 'group'>
}

export type PlayerSpawnedGameEvent = {
  type: GameEventType.PlayerSpawned
  date: Date
  meta: LogLineMeta
  player: Pick<Player, 'userId' | 'nickname' | 'displayName' | 'class'>
}

export type ClassPickerResultGameEvent = {
  type: GameEventType.ClassPickerResult
  date: Date
  meta: LogLineMeta
  classes: string[]
}

export type RandomClassesAssignedGameEvent = {
  type: GameEventType.RandomClassesAssigned
  date: Date
  meta: LogLineMeta
}

export type PlayerChangedClassGameEvent = {
  type: GameEventType.PlayerChangedClass
  date: Date
  meta: LogLineMeta
  administrator: Pick<Player, 'userId' | 'nickname'>
  player: Pick<Player, 'userId' | 'nickname' | 'displayName' | 'class'>
}

export type PlayerKilledGameEvent = {
  type: GameEventType.PlayerKilled
  date: Date
  meta: LogLineMeta
  killer: Pick<Player, 'userId' | 'nickname' | 'displayName' | 'class'>
  victim: Pick<Player, 'userId' | 'nickname' | 'displayName' | 'class'>
}

export type PlayerBannedGameEvent = {
  type: GameEventType.PlayerBanned
  date: Date
  meta: LogLineMeta
  administrator: Pick<Player, 'userId' | 'nickname' | 'displayName'>
  player: Pick<Player, 'userId' | 'nickname' | 'displayName'>
  duration: number
  reason: string
}

export type PlayerTeleportedGameEvent = {
  type: GameEventType.PlayerTeleported
  date: Date
  meta: LogLineMeta
  administrator: Pick<Player, 'userId' | 'nickname' | 'displayName'>
  player: Pick<Player, 'userId' | 'nickname' | 'displayName'>
}

export type CassieAnnouncementStartedGameEvent = {
  type: GameEventType.CassieAnnouncementStarted
  date: Date
  meta: LogLineMeta
  administrator: Pick<Player, 'userId' | 'nickname' | 'displayName'>
  isSilent: boolean
  message: string
}

export type PlayerRespawnedGameEvent = {
  type: GameEventType.PlayerRespawned
  date: Date
  meta: LogLineMeta
  player: Pick<Player, 'userId' | 'nickname' | 'displayName' | 'class'>
}

export type RespawnManagerSpawnedPlayersGameEvent = {
  type: GameEventType.RespawnManagerSpawnedPlayers
  date: Date
  meta: LogLineMeta
  count: number
}

export type PlayerBroughtGameEvent = {
  type: GameEventType.PlayerBrought
  date: Date
  meta: LogLineMeta
  administrator: Pick<Player, 'userId' | 'nickname' | 'displayName'>
  player: Pick<Player, 'userId' | 'nickname' | 'displayName'>
}

export type WarheadCountdownStartedGameEvent = {
  type: GameEventType.WarheadCountdownStarted
  date: Date
  meta: LogLineMeta
}

export type WarheadDetonatedGameEvent = {
  type: GameEventType.WarheadDetonated
  date: Date
  meta: LogLineMeta
}

export type DecontaminationDisabledGameEvent = {
  type: GameEventType.DecontaminationDisabled
  date: Date
  meta: LogLineMeta
}

export type RateLimitExceededGameEvent = {
  type: GameEventType.RateLimitExceeded
  date: Date
  meta: LogLineMeta
  player: Partial<Pick<Player, 'userId'>> & Pick<Player, 'endpoint'>
}

export type DoorOpenedGameEvent = {
  type: GameEventType.DoorOpened
  date: Date
  meta: LogLineMeta
  administrator: Pick<Player, 'userId' | 'nickname' | 'displayName'>
  door: string
}

export type DoorClosedGameEvent = {
  type: GameEventType.DoorClosed
  date: Date
  meta: LogLineMeta
  administrator: Pick<Player, 'userId' | 'nickname' | 'displayName'>
  door: string
}

export type DoorUnlockedGameEvent = {
  type: GameEventType.DoorUnlocked
  date: Date
  meta: LogLineMeta
  administrator: Pick<Player, 'userId' | 'nickname' | 'displayName'>
  door: string
}

export type DoorLockedGameEvent = {
  type: GameEventType.DoorLocked
  date: Date
  meta: LogLineMeta
  administrator: Pick<Player, 'userId' | 'nickname' | 'displayName'>
  door: string
}

export type LobbyLockEnabledGameEvent = {
  type: GameEventType.LobbyLockEnabled
  date: Date
  meta: LogLineMeta
  administrator: Pick<Player, 'userId' | 'nickname' | 'displayName'>
}

export type LobbyLockDisabledGameEvent = {
  type: GameEventType.LobbyLockDisabled
  date: Date
  meta: LogLineMeta
  administrator: Pick<Player, 'userId' | 'nickname' | 'displayName'>
}

export type RoundLockEnabledGameEvent = {
  type: GameEventType.RoundLockEnabled
  date: Date
  meta: LogLineMeta
  administrator: Pick<Player, 'userId' | 'nickname' | 'displayName'>
}

export type RoundLockDisabledGameEvent = {
  type: GameEventType.RoundLockDisabled
  date: Date
  meta: LogLineMeta
  administrator: Pick<Player, 'userId' | 'nickname' | 'displayName'>
}

export type PlayerMutedGameEvent = {
  type: GameEventType.PlayerMuted
  date: Date
  meta: LogLineMeta
  administrator: Pick<Player, 'userId' | 'nickname' | 'displayName'>
  player: Pick<Player, 'userId' | 'nickname' | 'displayName'>
}

export type PlayerUnmutedGameEvent = {
  type: GameEventType.PlayerUnmuted
  date: Date
  meta: LogLineMeta
  administrator: Pick<Player, 'userId' | 'nickname' | 'displayName'>
  player: Pick<Player, 'userId' | 'nickname' | 'displayName'>
}

export type PlayerIntercomMuteRevokedGameEvent = {
  type: GameEventType.PlayerIntercomMuteRevoked
  date: Date
  meta: LogLineMeta
  administrator: Pick<Player, 'userId' | 'nickname' | 'displayName'>
  player: Pick<Player, 'userId' | 'nickname' | 'displayName'>
}

export type PlayerGotItemGameEvent = {
  type: GameEventType.PlayerGotItem
  date: Date
  meta: LogLineMeta
  administrator: Pick<Player, 'userId' | 'nickname' | 'displayName'>
  player: Pick<Player, 'userId' | 'nickname' | 'displayName'>
  item: string
}

export type PlayerSetNicknameGameEvent = {
  type: GameEventType.PlayerSetNickname
  date: Date
  meta: LogLineMeta
  administrator: Pick<Player, 'userId' | 'nickname' | 'displayName'>
  player: Pick<Player, 'userId' | 'nickname' | 'displayName'>
  nickname: string
}

export type GameEvent =
  | LoggerStartedGameEvent
  | RoundStartedGameEvent
  | RoundEndedGameEvent
  | PlayerPreauthenticatedGameEvent
  | PlayerAuthenticatedGameEvent
  | PlayerJoinedGameEvent
  | PlayerLeftGameEvent
  | PlayerSentDoNotTrackSignalGameEvent
  | PlayerAssignedToGroupGameEvent
  | PlayerSpawnedGameEvent
  | ClassPickerResultGameEvent
  | RandomClassesAssignedGameEvent
  | PlayerChangedClassGameEvent
  | PlayerKilledGameEvent
  | PlayerBannedGameEvent
  | PlayerTeleportedGameEvent
  | CassieAnnouncementStartedGameEvent
  | PlayerRespawnedGameEvent
  | RespawnManagerSpawnedPlayersGameEvent
  | PlayerBroughtGameEvent
  | WarheadCountdownStartedGameEvent
  | WarheadDetonatedGameEvent
  | DecontaminationDisabledGameEvent
  | RateLimitExceededGameEvent
  | DoorOpenedGameEvent
  | DoorClosedGameEvent
  | DoorUnlockedGameEvent
  | DoorLockedGameEvent
  | LobbyLockEnabledGameEvent
  | LobbyLockDisabledGameEvent
  | RoundLockEnabledGameEvent
  | RoundLockDisabledGameEvent
  | PlayerMutedGameEvent
  | PlayerUnmutedGameEvent
  | PlayerIntercomMuteRevokedGameEvent
  | PlayerGotItemGameEvent
  | PlayerSetNicknameGameEvent

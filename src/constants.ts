export const IS_NODE_ENV =
  typeof process !== 'undefined' && process.versions !== null && process.versions.node !== null

export const SERVER_LOG_SEPARATOR = '|'

export enum ServerLogType {
  ConnectionUpdate = 0,
  RemoteAdminActivity_GameChanging = 1,
  RemoteAdminActivity_Misc = 2,
  KillLog = 3,
  GameEvent = 4,
  InternalMessage = 5,
  RateLimit = 6,
  Teamkill = 7,
  Suicide = 8,
  // added in unknown version
  AdminChat = 9
}

export enum ServerLogModule {
  Warhead = 0,
  Networking = 1,
  ClassChange = 2,
  Permissions = 3,
  Administrative = 4,
  Logger = 5,
  DataAccess = 6,
  Detector = 7
}

export enum GameEventType {
  // 2021-11-15 14:34:14.981 +03:00 | Internal            | Logger         | Started logging. Game version: 11.0.0, private beta: NO.
  LoggerStarted = 0,
  // 2021-11-15 16:00:21.504 +03:00 | Game Event          | Logger         | Round has been started.
  RoundStarted = 1,
  // 2021-11-15 16:15:59.553 +03:00 | Game Event          | Logger         | Round finished! Anomalies: 0 | Chaos: 0 | Facility Forces: 6 | D escaped percentage: 0 | S escaped percentage: : 0
  RoundEnded = 2,
  // 2021-11-15 14:34:26.195 +03:00 | Connection update   | Networking     | 76561199012345678@steam preauthenticated from endpoint 127.0.0.1:9777.
  PlayerPreauthenticated = 3,
  // 2021-11-15 14:34:33.485 +03:00 | Connection update   | Networking     | 76561199012345678@steam authenticated from endpoint 127.0.0.1:55889. Player ID assigned: 2. Auth token serial number: qwerty123
  PlayerAuthenticated = 4,
  // 2021-11-15 14:34:34.214 +03:00 | Connection update   | Networking     | Nickname of 76561199012345678@steam is now John Doe.
  PlayerJoined = 5,
  // 2021-11-15 16:09:20.619 +03:00 | Connection update   | Networking     | John Doe 76561199012345678@steam disconnected from IP address 127.0.0.1. Last class: Spectator (Spectator)
  PlayerLeft = 6,
  // 2021-11-15 21:14:47.293 +03:00 | Connection update   | Networking     | Player (CharacterClassManager)) connected from IP 127.0.0.1 sent Do Not Track signal.
  PlayerSentDoNotTrackSignal = 7,
  // 2021-11-15 15:59:40.235 +03:00 | Connection update   | Permissions    | John Doe (76561199012345678@steam) has been assigned to group Administrator.
  PlayerAssignedToGroup = 8,
  // 2021-11-15 16:00:22.506 +03:00 | Game Event          | Class change   | John Doe (76561199012345678@steam) spawned as Class-D Personnel.
  PlayerSpawned = 9,
  // 2021-11-15 16:00:22.556 +03:00 | Game Event          | Logger         | Class Picker Result: ClassD | Scp93953 | FacilityGuard | ClassD | Scientist | FacilityGuard | ClassD | Scp049 | Scientist | FacilityGuard | ClassD | ClassD | FacilityGuard | ClassD | Scp173 | ClassD | FacilityGuard | Scientist | ClassD | Scp079 | ClassD | ClassD | ClassD |
  ClassPickerResult = 10,
  // 2021-11-15 16:17:09.657 +03:00 | Game Event          | Logger         | Random classes have been assigned by DCP.
  RandomClassesAssigned = 11,
  // 2021-11-15 16:00:27.861 +03:00 | Remote Admin        | Class change   | John Doe (76561199012345678@steam) changed class of player John Doe (76561199012345678@steam) to Spectator.
  PlayerChangedClass = 12,
  // 2021-11-15 16:02:03.624 +03:00 | Kill                | Class change   | John Doe (76561199012345678@steam) playing as Class-D Personnel has been killed by John Doe (76561199012345678@steam) using SCP-173 playing as SCP-173.
  // 2021-11-15 21:07:31.715 +03:00 | Kill                | Class change   | Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam) playing as Chaos Insurgency Repressor has been killed by Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam) using LOGICER playing as Nine-Tailed Fox Captain.
  PlayerKilled = 13,
  // 2021-11-15 16:02:23.853 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) banned player scp (76561199012345678@steam). Ban duration: 30. Reason: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum quis tempor nisl. Aliquam aliquam, nisi sed hendrerit pretium, odio felis sollicitudin tellus, ac ultricies ante nisl id sem. Ut molestie purus eu lorem sagittis suscipit.
  PlayerBanned = 14,
  // 2021-11-15 16:07:38.158 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) teleported themself to player John Doe (76561199012345678@steam).
  // 2021-11-15 21:07:49.681 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) teleported themself to player Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam).
  PlayerTeleported = 15,
  // 2021-11-15 16:08:44.129 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) started a cassie announcement: Attention . SCP 0 4 9 has escaped the facility . . .g2 Report to nearby Site . ready .
  // 2021-11-15 20:36:33.070 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) started a silent cassie announcement: pitch_0.8 .g4 . . .g4 . . .g4 . . . warning jam_010_2 pitch_0.9 . all .g6 personel . facility light system .g2 pitch_0.7 jam_001_3 .g2 .g2 jam_50_2 pitch_0.8 critical pitch_0.6 .g2 .g1 .g2 pitch_0.8 jam_3_4 detected . . .g1 .g5 light jam_5_3 may . b .g1 unstable pitch_0.8 jam_4_4 .g4 . . jam_4_4 .g4 . . jam_4_4 .g4 .
  CassieAnnouncementStarted = 16,
  // 2021-11-15 16:09:13.171 +03:00 | Game Event          | Class change   | Player John Doe (76561199012345678@steam) respawned as NtfSergeant.
  PlayerRespawned = 17,
  // 2021-11-15 16:09:13.183 +03:00 | Game Event          | Class change   | RespawnManager has successfully spawned 11 players as NineTailedFox!
  RespawnManagerSpawnedPlayers = 18,
  // 2021-11-15 16:13:09.185 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) brought player John Doe (76561199012345678@steam).
  PlayerBrought = 19,
  // 2021-11-15 16:47:07.502 +03:00 | Game Event          | Warhead        | Countdown started.
  WarheadCountdownStarted = 20,
  // 2021-11-15 16:49:18.528 +03:00 | Game Event          | Warhead        | Warhead detonated.
  WarheadDetonated = 21,
  // 2021-11-15 16:49:18.528 +03:00 | Remote Admin        | Administrative | LCZ decontamination has been disabled by detonation of the Alpha Warhead.
  DecontaminationDisabled = 22,
  // 2021-11-15 18:53:00.159 +03:00 | Rate Limit          | Networking     | Incoming connection from endpoint 76561199012345678@steam (127.0.0.1:12207) rejected due to exceeding the rate limit.
  RateLimitExceeded = 23,
  // 2021-11-15 19:06:11.128 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam)opened door **.
  DoorOpened = 24,
  // 2021-11-15 19:06:31.086 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam)closed door **.
  DoorClosed = 25,
  // 2021-11-15 19:07:49.381 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam)unlocked door **.
  DoorUnlocked = 26,
  // 2021-11-15 19:06:32.954 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam)locked door **.
  DoorLocked = 27,
  // 2021-11-15 19:06:11.972 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) enabled lobby lock.
  LobbyLockEnabled = 28,
  // 2021-11-15 19:07:04.681 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) disabled lobby lock.
  LobbyLockDisabled = 29,
  // 2021-11-15 19:06:11.325 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) enabled round lock.
  RoundLockEnabled = 30,
  // 2021-11-15 21:08:39.746 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) disabled round lock.
  RoundLockDisabled = 31,
  // 2021-11-15 21:08:23.506 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) muted player Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam).
  PlayerMuted = 32,
  // 2021-11-15 21:08:36.644 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) unmuted player Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam).
  PlayerUnmuted = 33,
  // 2021-11-15 21:08:34.311 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) revoked an intercom mute of player Jane Doe<color=#855439>*</color> (John Doe) (76561199012345678@steam).
  PlayerIntercomMuteRevoked = 34,
  // 2021-11-15 20:09:34.481 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) gave Adrenaline to John Doe (76561199012345678@steam).
  PlayerGotItem = 35,
  // 2021-11-15 20:11:41.783 +03:00 | Remote Admin        | Administrative | John Doe (76561199012345678@steam) set nickname of player 42 (John Doe) to "Jane Doe".
  PlayerSetNickname = 36
}

// biome-ignore format:
export const ServerLogTypeToEnum: Record<string, ServerLogType> = {
  'Connection update': ServerLogType.ConnectionUpdate,
  'Remote Admin': ServerLogType.RemoteAdminActivity_GameChanging,
  'Remote Admin - Misc': ServerLogType.RemoteAdminActivity_Misc,
  'Kill': ServerLogType.KillLog,
  'Game Event': ServerLogType.GameEvent,
  'Internal': ServerLogType.InternalMessage,
  'Rate Limit': ServerLogType.RateLimit,
  'Teamkill': ServerLogType.Teamkill,
  'Suicide': ServerLogType.Suicide,
  'AdminChat': ServerLogType.AdminChat
}

// biome-ignore format:
export const ServerLogModuleToEnum: Record<string, ServerLogModule> = {
  'Warhead': ServerLogModule.Warhead,
  'Networking': ServerLogModule.Networking,
  'Class change': ServerLogModule.ClassChange,
  'Permissions': ServerLogModule.Permissions,
  'Administrative': ServerLogModule.Administrative,
  'Logger': ServerLogModule.Logger,
  'Data access': ServerLogModule.DataAccess,
  'FF Detector': ServerLogModule.Detector,
}

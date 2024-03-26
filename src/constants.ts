export const SERVER_LOG_SEPARATOR = '|'

export enum ServerLogType {
  ConnectionUpdate,
  RemoteAdminActivity_GameChanging,
  RemoteAdminActivity_Misc,
  KillLog,
  GameEvent,
  InternalMessage,
  RateLimit,
  Teamkill,
  Suicide,
  // added in unknown version
  AdminChat
}

export enum ServerLogModule {
  Warhead,
  Networking,
  ClassChange,
  Permissions,
  Administrative,
  Logger,
  DataAccess,
  Detector
}

// prettier-ignore
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

// prettier-ignore
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

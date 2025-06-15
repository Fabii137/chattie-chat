export const allRoomRelations = [
  "users",
  "creator",
  "server",
  "server.users",
  "server.creator"
];


export const allUserRelations = [
  "friends",
  "incomingFriendRequests",
  "outgoingFriendRequests",

  "privateRooms",
  "privateRooms.users",
  "privateRooms.creator",

  "servers",
  "servers.users",
  "servers.creator",
  "servers.rooms",

  "servers.rooms",
  "servers.rooms.users",
  "servers.rooms.creator",
];


export const allMessageRelations = [
  "sender",
  "room",
  "room.users",
];


export const allServerRelations = [
  "users",
  "creator",
  "invites",

  "rooms",
  "rooms.users",
  "rooms.creator",
];

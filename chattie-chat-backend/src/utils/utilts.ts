export const allRoomRelations = [
  "users",
  "messages",
  "messages.sender",
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
  "privateRooms.messages",
  "privateRooms.messages.sender",
  "privateRooms.creator",

  "servers",
  "servers.users",
  "servers.creator",
  "servers.rooms",

  "servers.rooms.messages",
  "servers.rooms.messages.sender",
  "servers.rooms.users",
  "servers.rooms.creator",
];


export const allMessageRelations = [
  "sender",
  "room",
  "room.users",
  "room.creator",
  "room.server",
  "room.messages",
  "room.messages.sender",
];


export const allServerRelations = [
  "users",
  "creator",
  "rooms",
  "invites",

  "rooms.users",
  "rooms.creator",
  "rooms.messages",
  "rooms.messages.sender",
];

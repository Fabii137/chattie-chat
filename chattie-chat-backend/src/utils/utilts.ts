export const allRoomRelations = [
  "users",
  "messages",
  "messages.sender",
  "server",
  "creator"
];

export const allUserRelations = [
  "friends",
  "incomingFriendRequests",
  "outgoingFriendRequests",
  "privateRooms",
  "privateRooms.users",
  "privateRooms.messages",
  "privateRooms.messages.sender",
  "servers.users",
  "servers.rooms"
];

export const allMessageRelations = [
  "sender",
  "sender.privateRooms",
  "room",
  "room.users"
];

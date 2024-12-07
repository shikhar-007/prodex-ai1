const SOCKET_EVENTS = Object.freeze({
  ROOM_CREATE: 'room:create',
  ROOM_CREATED: 'room:created',
  QUERY_SEND: 'query:send',
  QUERY_RESPONSE: 'query:response',
});

module.exports = { SOCKET_EVENTS };

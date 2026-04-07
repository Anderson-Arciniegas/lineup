/**
 * Deben coincidir con el servicio `background-processes` (Socket.IO).
 * Namespace: `/notifications-socket`
 */
export const NOTIFICATION_SOCKET_NAMESPACE = '/notifications-socket';

/** Evento con el payload de notificación (ajustar si el backend usa otro nombre). */
export const NOTIFICATION_SOCKET_EVENT = 'notification';

/**
 * Tras `connect`, el cliente emite este evento para unirse a la room:
 * `socket.emit('notifications', { type: 'user' | 'business', id: number })`
 */
export const NOTIFICATION_SOCKET_JOIN_EVENT = 'notifications';

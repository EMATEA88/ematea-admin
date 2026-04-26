// services/socket.ts
import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export function connectAdminSocket(token: string): Socket {
  if (socket && socket.connected) return socket

  socket = io(import.meta.env.VITE_API_URL || "http://localhost:3333", {
    transports: ["websocket"],
    auth: { token },
    reconnection: true,
  })

  socket.on("connect", () => {
  // Use s.id ou socket.id apenas dentro deste callback
  console.log("✅ Admin Socket Conectado ID:", socket?.id);
});

  socket.on("connect_error", (err) => {
    console.error("❌ Erro de conexão socket:", err.message)
  })

  return socket
}

export function disconnectAdminSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
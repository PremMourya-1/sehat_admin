import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { COMMON_IMAGE_URL } from "../Service/service";

const SocketContext = createContext(null);

// One socket connection for the whole admin session. This provider only
// ever mounts inside AdminLayout (behind ProtectedRoute), so by the time it
// runs the admin_token cookie is already set — socket.io sends it
// automatically on the handshake since withCredentials matches the
// backend's CORS credentials: true (see utils/socket.js authenticateSocket).
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const instance = io(COMMON_IMAGE_URL, { withCredentials: true });
    setSocket(instance);
    return () => instance.disconnect();
  }, []);

  const value = useMemo(() => ({ socket }), [socket]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
};

export default SocketContext;

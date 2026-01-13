import { useState, useEffect } from "react";
import io from "socket.io-client";
import notificationApi from "../../api/notificationApi";
import { SOCKET_URL } from "../../config/constants";

const useAdminNotificationSocket = (token, userId, role) => {
    const [socket, setSocket] = useState(null);
    const [adminNotifications, setAdminNotifications] = useState([]);
    const [unreadAdminCount, setUnreadAdminCount] = useState(0);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!token || !userId || role !== "admin") return;

        const socketInstance = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket"],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketInstance.on("connect", () => {
            setConnected(true);
        });

        socketInstance.on("disconnect", () => {
            setConnected(false);
        });

        socketInstance.on("connect_error", (err) => {
            console.error("Socket Error:", err);
            setConnected(false);
        });

        socketInstance.on("admin:notification:new", (data) => {
            setUnreadAdminCount(prev => prev + 1);
            const newItems = Array.isArray(data) ? data : [data];
            setAdminNotifications(prev => [...newItems, ...prev]);
        });

        setSocket(socketInstance);

        return () => {
            if (socketInstance) socketInstance.disconnect();
        };
    }, [token, userId, role]);

    return {
        socket,
        connected,
        adminNotifications,
        unreadAdminCount,
        setAdminNotifications,
        setUnreadAdminCount
    };
};

export default useAdminNotificationSocket;

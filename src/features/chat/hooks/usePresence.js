import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * usePresence
 * Tracks real-time online/offline state for a list of userIds.
 *
 * Usage:
 *   const { isOnline, lastSeen } = usePresence(['abc123', 'def456']);
 *   isOnline('abc123') → true/false
 *   lastSeen('abc123') → ISO date string or null
 */
export const usePresence = (userIds = []) => {
    const socket = useSocket();
    const [onlineMap, setOnlineMap]   = useState({});  // userId → true
    const [lastSeenMap, setLastSeenMap] = useState({}); // userId → ISO string
    const queriedRef = useRef(false);

    // Ask the server which of our userIds are currently online
    const queryPresence = useCallback(() => {
        if (!socket || !userIds.length) return;
        socket.emit('check_presence', userIds, (result) => {
            if (result) setOnlineMap(result);
        });
    }, [socket, userIds.join(',')]); // eslint-disable-line

    // Initial query whenever socket connects or userIds change
    useEffect(() => {
        if (!socket?.socketVersion) return;
        queriedRef.current = false;
        queryPresence();
    }, [socket?.socketVersion, queryPresence]);

    // Listen for broadcast presence events
    useEffect(() => {
        if (!socket) return;

        const offOnline = socket.on('user_online', ({ userId }) => {
            if (!userIds.includes(userId)) return;
            setOnlineMap(prev => ({ ...prev, [userId]: true }));
            // Clear last seen when they come back online
            setLastSeenMap(prev => { const n = { ...prev }; delete n[userId]; return n; });
        });

        const offOffline = socket.on('user_offline', ({ userId, lastSeen }) => {
            if (!userIds.includes(userId)) return;
            setOnlineMap(prev => ({ ...prev, [userId]: false }));
            if (lastSeen) setLastSeenMap(prev => ({ ...prev, [userId]: lastSeen }));
        });

        return () => {
            offOnline?.();
            offOffline?.();
        };
    }, [socket, userIds.join(',')]); // eslint-disable-line

    const isOnline  = useCallback((userId) => !!onlineMap[userId], [onlineMap]);
    const getLastSeen = useCallback((userId) => lastSeenMap[userId] || null, [lastSeenMap]);

    return { isOnline, getLastSeen, onlineMap };
};

/**
 * useUserPresence
 * Single-user convenience wrapper.
 *
 * Usage:
 *   const { online, lastSeen } = useUserPresence(userId);
 */
export const useUserPresence = (userId) => {
    const { isOnline, getLastSeen } = usePresence(userId ? [userId] : []);
    return {
        online:   userId ? isOnline(userId)   : false,
        lastSeen: userId ? getLastSeen(userId) : null,
    };
};
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import authService from '../../../services/auth.service';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
    || import.meta.env.VITE_API_URL?.replace('/api', '')
    || 'http://localhost:3002';

export const SocketProvider = ({ children, enabled = false }) => {
    const socketRef = useRef(null);
    // Increment this every time the socket fully connects so dependents re-run
    const [socketVersion, setSocketVersion] = useState(0);
    const [connected, setConnected] = useState(false);

    // ── Build / destroy socket ────────────────────────────────────────────────
    useEffect(() => {
        if (!enabled) return;

        const token = authService.getToken();
        if (!token) return;

        // Tear down any previous socket before creating a new one
        socketRef.current?.disconnect();

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1500,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            // Bump version so every useEffect that depends on the socket re-runs
            setSocketVersion(v => v + 1);
        });

        socket.on('disconnect', () => setConnected(false));

        socket.on('connect_error', (err) => {
            console.warn('[Socket] connect_error:', err.message);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setConnected(false);
        };
    }, [enabled]);

    // ── Stable helpers that always use the live ref ───────────────────────────

    /**
     * Register an event listener.
     * Returns an unsubscribe function.
     * Safe to call even before connect — socket.io queues listeners.
     */
    const on = useCallback((event, handler) => {
        const socket = socketRef.current;
        if (!socket) return () => {};
        socket.on(event, handler);
        return () => socket.off(event, handler);
    }, []);                           // no deps — always reads ref live

    const emit = useCallback((event, data, ack) => {
        const socket = socketRef.current;
        if (!socket?.connected) return;
        socket.emit(event, data, ack);
    }, []);

    const joinConversation   = useCallback((id) => emit('join_conversation',  id),          [emit]);
    const leaveConversation  = useCallback((id) => emit('leave_conversation', id),          [emit]);
    const sendTypingStart    = useCallback((id) => emit('typing_start',  { conversationId: id }), [emit]);
    const sendTypingStop     = useCallback((id) => emit('typing_stop',   { conversationId: id }), [emit]);
    const markRead           = useCallback((id) => emit('mark_read',     { conversationId: id }), [emit]);

    const sendSocketMessage  = useCallback((conversationId, body, attachment, ack) =>
        emit('send_message', { conversationId, body, attachment }, ack), [emit]);

    const reactMessage       = useCallback((messageId, emoji, conversationId, ack) =>
        emit('react_message', { messageId, emoji, conversationId }, ack), [emit]);

    const deleteSocketMessage = useCallback((messageId, conversationId, ack) =>
        emit('delete_message', { messageId, conversationId }, ack), [emit]);

    return (
        <SocketContext.Provider value={{
            socketVersion,   // ← consumers put this in dependency arrays
            connected,
            on,
            emit,
            joinConversation,
            leaveConversation,
            sendTypingStart,
            sendTypingStop,
            sendSocketMessage,
            reactMessage,
            deleteSocketMessage,
            markRead,
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
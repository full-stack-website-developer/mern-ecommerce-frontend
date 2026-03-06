import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import chatService from '../../../services/chat.service';
import toast from 'react-hot-toast';

export const useChat = ({ conversationId, currentUserId, currentRole }) => {
    const socket = useSocket();
    const [messages, setMessages]       = useState([]);
    const [loading, setLoading]         = useState(false);
    const [sending, setSending]         = useState(false);
    const [hasMore, setHasMore]         = useState(false);
    const [page, setPage]               = useState(1);
    const [typingUsers, setTypingUsers] = useState([]);

    const typingTimeoutRef = useRef(null);
    const isTypingRef      = useRef(false);
    const bottomRef        = useRef(null);
    const containerRef     = useRef(null);

    // ── Load messages (HTTP) ──────────────────────────────────────────────────
    const loadMessages = useCallback(async (pageNum = 1, append = false) => {
        if (!conversationId) return;
        setLoading(true);
        try {
            const res = await chatService.getMessages(conversationId, pageNum);
            const fetched = res.data?.messages || [];
            setMessages(prev => append ? [...fetched, ...prev] : fetched);
            setHasMore(res.data?.hasMore || false);
            setPage(pageNum);
        } catch {
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    }, [conversationId]);

    // Reload whenever the conversation changes
    useEffect(() => {
        if (!conversationId) return;
        setMessages([]);
        setPage(1);
        setHasMore(false);
        setTypingUsers([]);
        loadMessages(1);
    }, [conversationId, loadMessages]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) loadMessages(page + 1, true);
    }, [loading, hasMore, page, loadMessages]);

    // ── Socket event listeners ────────────────────────────────────────────────
    // Re-register every time the socket (re)connects OR the conversation changes.
    // socket.socketVersion increments on every successful connect.
    useEffect(() => {
        if (!conversationId || !socket) return;

        // Join the room (safe to call even if we're not connected yet —
        // socket.io buffers it until the connection is established)
        socket.joinConversation(conversationId);

        const offNew = socket.on('new_message', ({ message, conversationId: cid }) => {
            if (cid !== conversationId) return;

            setMessages(prev => {
                // If this came in via HTTP the optimistic entry has already been
                // replaced by the real message — don't add a duplicate.
                if (prev.some(m => m._id === message._id)) return prev;

                // Replace optimistic placeholder (temp-*) that has the same body
                const idx = prev.findIndex(
                    m => m._id?.startsWith('temp-') && m.body === message.body
                );
                if (idx !== -1) {
                    const updated = [...prev];
                    updated[idx] = message;
                    return updated;
                }
                return [...prev, message];
            });

            // Let the server know we've read it
            socket.markRead(conversationId);
        });

        const offReaction = socket.on('message_reaction', ({ message }) => {
            setMessages(prev => prev.map(m => m._id === message._id ? message : m));
        });

        const offDeleted = socket.on('message_deleted', ({ messageId }) => {
            setMessages(prev => prev.map(m =>
                m._id === messageId
                    ? { ...m, deletedAt: new Date().toISOString(), body: '', attachment: null }
                    : m
            ));
        });

        const offTypingStart = socket.on('user_typing', ({ conversationId: cid, userId, name }) => {
            if (cid !== conversationId || userId === currentUserId) return;
            setTypingUsers(prev => prev.includes(name) ? prev : [...prev, name]);
        });

        const offTypingStop = socket.on('user_stop_typing', ({ conversationId: cid }) => {
            if (cid !== conversationId) return;
            setTypingUsers([]);
        });

        const offRead = socket.on('messages_read', ({ conversationId: cid, by }) => {
            if (cid !== conversationId || by === currentRole) return;
            setMessages(prev =>
                prev.map(m => m.senderRole === currentRole ? { ...m, isRead: true } : m)
            );
        });

        return () => {
            socket.leaveConversation(conversationId);
            offNew?.();
            offReaction?.();
            offDeleted?.();
            offTypingStart?.();
            offTypingStop?.();
            offRead?.();
        };
    // socket.socketVersion ensures this re-runs when the socket reconnects
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId, socket?.socketVersion, currentUserId, currentRole]);

    // Auto-scroll on new messages
    useEffect(() => {
        if (messages.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length]);

    // ── Typing ────────────────────────────────────────────────────────────────
    const handleTyping = useCallback(() => {
        if (!conversationId || !socket) return;
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            socket.sendTypingStart(conversationId);
        }
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            socket.sendTypingStop(conversationId);
        }, 1500);
    }, [conversationId, socket]);

    const stopTyping = useCallback(() => {
        if (isTypingRef.current && conversationId && socket) {
            isTypingRef.current = false;
            socket.sendTypingStop(conversationId);
        }
        clearTimeout(typingTimeoutRef.current);
    }, [conversationId, socket]);

    // ── Send message ──────────────────────────────────────────────────────────
    // Always sends via HTTP REST (which in the controller also emits to the room
    // via io.to(...).emit). This means the *sender's* optimistic message gets
    // replaced by the real one from the HTTP response, and the *receiver* gets
    // it via the socket `new_message` event fired by the controller.
    const sendMessage = useCallback(async (text, attachment = null) => {
        if ((!text?.trim() && !attachment) || sending) return false;
        setSending(true);
        stopTyping();

        const tempId = `temp-${Date.now()}`;
        const optimistic = {
            _id: tempId,
            body: text || '',
            senderRole: currentRole,
            senderId: { _id: currentUserId },
            attachment: attachment
                ? { url: attachment.url, type: attachment.type, originalName: attachment.originalName }
                : null,
            messageType: attachment
                ? (attachment.type === 'image' ? 'image' : 'file')
                : 'text',
            isRead: false,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimistic]);

        try {
            let res;
            if (attachment?.file) {
                const formData = new FormData();
                if (text?.trim()) formData.append('body', text.trim());
                formData.append('attachment', attachment.file);
                res = await chatService.sendMessageWithFile(conversationId, formData);
            } else {
                res = await chatService.sendMessage(conversationId, text);
            }

            const sent = res.data?.message;
            if (sent) {
                // Replace optimistic with confirmed message
                setMessages(prev => prev.map(m => m._id === tempId ? sent : m));
            }
            return true;
        } catch {
            // Roll back optimistic
            setMessages(prev => prev.filter(m => m._id !== tempId));
            toast.error('Failed to send message');
            return false;
        } finally {
            setSending(false);
        }
    }, [conversationId, currentRole, currentUserId, sending, stopTyping]);

    // ── Reactions & Delete (via socket) ──────────────────────────────────────
    const reactToMessage = useCallback((messageId, emoji) => {
        socket?.reactMessage(messageId, emoji, conversationId);
    }, [socket, conversationId]);

    const deleteMessage = useCallback((messageId) => {
        socket?.deleteSocketMessage(messageId, conversationId);
    }, [socket, conversationId]);

    return {
        messages,
        loading,
        sending,
        hasMore,
        typingUsers,
        bottomRef,
        containerRef,
        loadMore,
        sendMessage,
        reactToMessage,
        deleteMessage,
        handleTyping,
        stopTyping,
    };
};
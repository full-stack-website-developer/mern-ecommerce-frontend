import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MessageSquare, Bell, Users, Wifi, WifiOff, Search, Filter, Settings, RefreshCw } from 'lucide-react';
import SellerLayout from '../../components/layout/SellerLayout';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import { SocketProvider, useSocket } from '../../features/chat/context/SocketContext';
import chatService from '../../services/chat.service';
import useUserContext from '../../hooks/useUserContext';

const SellerMessagingInner = () => {
    const { user } = useUserContext();
    const socket = useSocket();
    const [searchParams, setSearchParams] = useSearchParams();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [totalUnread, setTotalUnread] = useState(0);
    const [filterStatus, setFilterStatus] = useState('all'); // all, unread, responded

    const loadConversations = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await chatService.getMyConversations();
            const list = res.data?.conversations || [];
            setConversations(list);
            const paramId = searchParams.get('conversation');
            if (paramId) {
                const match = list.find(c => c._id === paramId);
                if (match) setSelectedConv(prev => prev?._id === paramId ? prev : match);
            }
        } catch {
            if (!silent) toast.error('Failed to load conversations');
        } finally {
            if (!silent) setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refreshUnread = useCallback(async () => {
        try {
            const res = await chatService.getUnreadCount();
            setTotalUnread(res.data?.count || 0);
        } catch { /* silent */ }
    }, []);

    // Refresh list when a new message arrives (from socket)
    useEffect(() => {
        if (!socket) return;
        const off = socket.on('conversation_updated', () => {
            loadConversations(true);
            refreshUnread();
        });
        return () => off?.();
    }, [socket, loadConversations, refreshUnread]);

    useEffect(() => {
        loadConversations();
        refreshUnread();
        const interval = setInterval(() => {
            loadConversations(true);
            refreshUnread();
        }, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [loadConversations, refreshUnread]);

    const handleSelect = (conv) => {
        setSelectedConv(conv);
        setSearchParams({ conversation: conv._id });
        setConversations(prev => prev.map(c => c._id === conv._id ? { ...c, unreadBySeller: 0 } : c));
    };

    const handleRefresh = () => {
        loadConversations();
        refreshUnread();
    };

    const recipientName = selectedConv
        ? `${selectedConv.userId?.firstName || ''} ${selectedConv.userId?.lastName || ''}`.trim() || 'Customer'
        : '';
    const recipientAvatar = selectedConv?.userId?.avatar?.url;

    return (
        <SellerLayout>
            <div className="h-full max-h-screen">
                {/* Professional Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">Customer Messages</h1>
                                    <p className="text-sm text-gray-500">Manage customer conversations</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {/* Connection Status */}
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                                socket?.connected
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {socket?.connected ? (
                                    <>
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <Wifi className="w-4 h-4" />
                                        <span>Connected</span>
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="w-4 h-4" />
                                        <span>Disconnected</span>
                                    </>
                                )}
                            </div>

                            {/* Unread Count */}
                            {totalUnread > 0 && (
                                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
                                    <Bell className="w-4 h-4" />
                                    <span className="font-medium">{totalUnread} unread</span>
                                </div>
                            )}

                            {/* Refresh Button */}
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Refresh conversations"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex h-[calc(100vh-180px)] bg-gray-50">
                    {/* Sidebar */}
                    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                        {/* Sidebar Header */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-gray-900">Conversations</span>
                                    {conversations.length > 0 && (
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                            {conversations.length}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Search */}
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Filter */}
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                        filterStatus === 'all'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterStatus('unread')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                        filterStatus === 'unread'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    Unread
                                </button>
                            </div>
                        </div>

                        {/* Conversation List */}
                        <div className="flex-1 overflow-hidden">
                            <ConversationList
                                conversations={conversations}
                                selectedId={selectedConv?._id}
                                onSelect={handleSelect}
                                loading={loading}
                                role="seller"
                                searchQuery={searchQuery}
                                filterStatus={filterStatus}
                                onSearchChange={setSearchQuery}
                            />
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col">
                        <ChatWindow
                            conversationId={selectedConv?._id || null}
                            currentUserId={user?._id}
                            currentRole="seller"
                            recipientName={recipientName}
                            recipientAvatar={recipientAvatar}
                            subject={selectedConv?.subject}
                            recipientUserId={selectedConv?.userId?._id}
                        />
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

const SellerMessaging = () => (
    <SocketProvider enabled>
        <SellerMessagingInner />
    </SocketProvider>
);

export default SellerMessaging;
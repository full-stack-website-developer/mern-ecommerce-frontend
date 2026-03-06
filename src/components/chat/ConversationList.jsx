import { Search, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import Avatar from '../common/Avatar';

const timeAgo = (d) => {
    const diff = (Date.now() - new Date(d)) / 1000;
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const SkeletonItem = () => (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
            <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-2/5" />
                <div className="h-3 bg-gray-200 rounded w-1/6" />
            </div>
            <div className="h-3 bg-gray-200 rounded w-3/5" />
        </div>
    </div>
);

const ConversationList = ({
    conversations = [],
    selectedId,
    onSelect,
    loading,
    role,
    searchQuery,
    filterStatus = 'all',
    onSearchChange,
}) => {
    const filtered = conversations.filter((c) => {
        const name = role === 'seller'
            ? `${c.userId?.firstName || ''} ${c.userId?.lastName || ''}`.trim()
            : (c.sellerId?.storeName || '');
        
        const matchesSearch = name.toLowerCase().includes((searchQuery || '').toLowerCase());
        
        if (filterStatus === 'unread') {
            const unread = role === 'seller' ? c.unreadBySeller : c.unreadByUser;
            return matchesSearch && unread > 0;
        }
        
        return matchesSearch;
    });

    return (
        <div className="flex flex-col h-full bg-white">
            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div>
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonItem key={i} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {filterStatus === 'unread' ? 'No unread messages' : 'No conversations'}
                        </h3>
                        <p className="text-sm text-gray-500 max-w-sm">
                            {filterStatus === 'unread' 
                                ? 'All caught up! No unread messages at the moment.'
                                : role === 'user' 
                                    ? 'Contact a seller from any product page to start chatting.' 
                                    : 'Customer conversations will appear here when they message you.'
                            }
                        </p>
                    </div>
                ) : (
                    <div>
                        {filtered.map((conv) => {
                            const isSelected = conv._id === selectedId;
                            const name = role === 'seller'
                                ? `${conv.userId?.firstName || ''} ${conv.userId?.lastName || ''}`.trim() || 'Customer'
                                : (conv.sellerId?.storeName || 'Seller');
                            const avatarSrc = role === 'seller' ? conv.userId?.avatar?.url : conv.sellerId?.logo?.url;
                            const unread = role === 'seller' ? conv.unreadBySeller : conv.unreadByUser;
                            const hasUnread = unread > 0;

                            return (
                                <button
                                    key={conv._id}
                                    onClick={() => onSelect(conv)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-100 hover:bg-gray-50 ${
                                        isSelected ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
                                    }`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <Avatar 
                                            src={avatarSrc || 'https://res.cloudinary.com/dpmvrta2s/image/upload/v1770050272/default-image_wvampm.jpg'} 
                                            name={name}
                                            className="w-10 h-10"
                                        />
                                        {hasUnread && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                                {unread > 9 ? '9+' : unread}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className={`text-sm truncate ${
                                                hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                                            }`}>
                                                {name}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-gray-500">
                                                    {timeAgo(conv.lastMessageAt)}
                                                </span>
                                                {hasUnread && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {conv.subject && (
                                            <p className="text-xs text-blue-600 font-medium truncate mb-1 bg-blue-50 px-2 py-0.5 rounded inline-block">
                                                Re: {conv.subject}
                                            </p>
                                        )}
                                        
                                        <p className={`text-xs truncate ${
                                            hasUnread ? 'text-gray-700 font-medium' : 'text-gray-500'
                                        }`}>
                                            {conv.lastMessage || 'No messages yet'}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationList;
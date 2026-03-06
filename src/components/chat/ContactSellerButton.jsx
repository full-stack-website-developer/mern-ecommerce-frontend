import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MessageCircle, ArrowRight } from 'lucide-react';
import chatService from '../../services/chat.service';
import useUserContext from '../../hooks/useUserContext';

/**
 * ContactSellerButton - Professional button to initiate conversations with sellers
 * Usage: <ContactSellerButton sellerId={product.seller._id} sellerName={product.seller.storeName} productName={product.name} />
 */
const ContactSellerButton = ({ sellerId, sellerName, productName, orderId, className = '', variant = 'default' }) => {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleContact = async () => {
        if (!user) {
            toast.error('Please log in to contact the seller');
            navigate('/login');
            return;
        }
        if (!sellerId) {
            toast.error('Seller information not available');
            return;
        }
        setLoading(true);
        try {
            const subject = productName ? `Inquiry about: ${productName}` : '';
            const res = await chatService.startConversation(sellerId, subject, orderId || null);
            const convId = res.data?.conversation?._id;
            toast.success(`Connected with ${sellerName || 'seller'}`);
            navigate(`/messages?conversation=${convId}`);
        } catch (err) {
            toast.error(err?.message || 'Failed to start conversation');
        } finally {
            setLoading(false);
        }
    };

    // Different button variants for different contexts
    const variants = {
        default: `inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`,
        primary: `inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm`,
        outline: `inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`,
        minimal: `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-blue-600 hover:bg-blue-50 font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`
    };

    return (
        <button
            onClick={handleContact}
            disabled={loading}
            className={`${variants[variant]} ${className}`}
            title={`Start a conversation with ${sellerName || 'this seller'}`}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                <MessageCircle className="w-4 h-4" />
            )}
            <span>{loading ? 'Connecting...' : `Contact ${sellerName || 'Seller'}`}</span>
            {!loading && variant === 'primary' && <ArrowRight className="w-4 h-4" />}
        </button>
    );
};

export default ContactSellerButton;
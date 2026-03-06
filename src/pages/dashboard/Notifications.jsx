import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SellerLayout from '../../components/layout/SellerLayout';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import dashboardService from '../../services/dashboard.service';
import useNotificationContext from '../../hooks/useNotificationContext';
import Pagination from '../../components/common/Pagination';

const iconByType = {
    order: '📦',
    promotion: '🎉',
    account: '👤',
    payment: '💳',
    support: '🎫',
};

const formatTime = (dateValue) => new Date(dateValue).toLocaleString();

const Notifications = ({ layout = 'user' }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { syncUnreadCount, decrementUnreadCount, clearUnreadCount } = useNotificationContext();
    const [page, setPage] = useState(1);
    const PER_PAGE = 12;

    const LayoutComponent =
        layout === 'admin'
            ? AdminLayout
            : layout === 'seller'
                ? SellerLayout
                : DashboardLayout;

    const loadNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const res = await dashboardService.getNotifications();
            if (res.success) {
                const list = Array.isArray(res?.data?.notifications) ? res.data.notifications : [];
                setNotifications(list);
                syncUnreadCount(list.reduce((total, item) => total + (item?.read ? 0 : 1), 0));
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, [syncUnreadCount]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const markSingleRead = async (notificationId) => {
        try {
            const target = notifications.find((item) => item._id === notificationId);
            if (!target || target.read) return;

            const res = await dashboardService.markNotificationRead(notificationId);
            if (res.success) {
                setNotifications((prev) =>
                    prev.map((item) => (item._id === notificationId ? { ...item, read: true } : item))
                );
                decrementUnreadCount(1);
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to update notification');
        }
    };

    const markAllRead = async () => {
        try {
            const res = await dashboardService.markAllNotificationsRead();
            if (res.success) {
                setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
                clearUnreadCount();
                toast.success('All notifications marked as read');
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to update notifications');
        }
    };

    const unreadCount = notifications.reduce((total, item) => total + (item?.read ? 0 : 1), 0);
    const totalPages = Math.max(1, Math.ceil(notifications.length / PER_PAGE));
    const paginatedNotifications = notifications.slice((page - 1) * PER_PAGE, (page - 1) * PER_PAGE + PER_PAGE);

    return (
        <LayoutComponent>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Notifications</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                        </p>
                    </div>
                    <Button variant="outline" onClick={markAllRead} disabled={loading || unreadCount === 0}>
                        Mark All as Read
                    </Button>
                </div>

                <Card>
                    {loading ? (
                        <div className="py-12 text-center text-gray-500">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">No notifications found.</div>
                    ) : (
                        <div className="space-y-4">
                            {paginatedNotifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 rounded-lg border ${
                                        notification.read ? 'bg-gray-50 border-gray-200' : 'bg-white border-primary-200'
                                    }`}
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="text-2xl">{iconByType[notification.type] || '🔔'}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold">{notification.title}</h3>
                                                {!notification.read && <Badge variant="primary" className="text-xs">New</Badge>}
                                            </div>
                                            <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-gray-500">{formatTime(notification.createdAt)}</p>
                                                {!notification.read && (
                                                    <Button
                                                        variant="ghost"
                                                        className="text-xs"
                                                        onClick={() => markSingleRead(notification._id)}
                                                    >
                                                        Mark as read
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && !loading && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            scrollToTop
                        />
                    )}
                </Card>
            </div>
        </LayoutComponent>
    );
};

export default Notifications;

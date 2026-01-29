import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'Order Shipped',
      message: 'Your order #ORD-001 has been shipped and is on its way.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'promotion',
      title: 'Special Offer',
      message: 'Get 20% off on all electronics. Limited time offer!',
      time: '5 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'order',
      title: 'Order Delivered',
      message: 'Your order #ORD-002 has been delivered successfully.',
      time: '1 day ago',
      read: true,
    },
    {
      id: 4,
      type: 'account',
      title: 'Profile Updated',
      message: 'Your profile information has been updated successfully.',
      time: '2 days ago',
      read: true,
    },
    {
      id: 5,
      type: 'order',
      title: 'Order Confirmed',
      message: 'Your order #ORD-003 has been confirmed and is being processed.',
      time: '3 days ago',
      read: true,
    },
  ];

  const getIcon = (type) => {
    const icons = {
      order: '📦',
      promotion: '🎉',
      account: '👤',
      payment: '💳',
    };
    return icons[type] || '🔔';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <Button variant="outline">Mark All as Read</Button>
        </div>

        <Card>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.read
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-primary-200'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{getIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{notification.title}</h3>
                      {!notification.read && (
                        <Badge variant="primary" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;

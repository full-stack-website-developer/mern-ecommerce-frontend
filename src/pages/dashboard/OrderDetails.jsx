import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';

const OrderDetails = () => {
  const { id } = useParams();

  const order = {
    id: id || 'ORD-001',
    date: '2026-01-25',
    status: 'Shipped',
    trackingNumber: 'TRK-123456789',
    items: [
      { id: 1, name: 'Product Name 1', quantity: 2, price: 99.99, image: 'https://via.placeholder.com/100' },
      { id: 2, name: 'Product Name 2', quantity: 1, price: 149.99, image: 'https://via.placeholder.com/100' },
    ],
    shipping: {
      name: 'John Doe',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
    },
    subtotal: 349.98,
    shipping: 10.00,
    tax: 35.00,
    total: 394.98,
  };

  const timeline = [
    { status: 'Order Placed', date: '2026-01-25 10:00 AM', completed: true },
    { status: 'Payment Confirmed', date: '2026-01-25 10:05 AM', completed: true },
    { status: 'Processing', date: '2026-01-25 11:00 AM', completed: true },
    { status: 'Shipped', date: '2026-01-26 09:00 AM', completed: true },
    { status: 'Out for Delivery', date: null, completed: false },
    { status: 'Delivered', date: null, completed: false },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Order Details</h1>
          <Button variant="outline">Back to Orders</Button>
        </div>

        {/* Order Info */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Order Information</h3>
              <p className="text-sm text-gray-600">Order ID: {order.id}</p>
              <p className="text-sm text-gray-600">Date: {order.date}</p>
              <p className="text-sm text-gray-600">Tracking: {order.trackingNumber}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Order Status</h3>
              <Badge variant="primary" className="text-lg px-4 py-2">
                {order.status}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Order Timeline */}
        <Card>
          <h2 className="text-xl font-bold mb-6">Order Tracking</h2>
          <div className="space-y-4">
            {timeline.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {step.completed ? '✓' : index + 1}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.status}
                  </div>
                  {step.date && (
                    <div className="text-sm text-gray-600">{step.date}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Order Items */}
        <Card>
          <h2 className="text-xl font-bold mb-6">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Shipping Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
            <div className="text-gray-700">
              <p>{order.shipping.name}</p>
              <p>{order.shipping.address}</p>
              <p>{order.shipping.city}, {order.shipping.state} {order.shipping.zip}</p>
              <p>{order.shipping.country}</p>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <Button variant="primary">Track Package</Button>
          <Button variant="outline">Download Invoice</Button>
          <Button variant="outline">Cancel Order</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderDetails;

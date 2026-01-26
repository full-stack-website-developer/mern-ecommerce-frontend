import MainLayout from '../components/layout/MainLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';

const Cart = () => {
  const cartItems = [
    {
      id: 1,
      name: 'Product Name 1',
      price: 99.99,
      quantity: 2,
      image: 'https://via.placeholder.com/150x150',
    },
    {
      id: 2,
      name: 'Product Name 2',
      price: 149.99,
      quantity: 1,
      image: 'https://via.placeholder.com/150x150',
    },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 10.00;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Cart', href: '/cart' },
          ]}
        />

        <h1 className="text-3xl font-bold mb-8 mt-4">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Add some products to get started!</p>
              <Button variant="primary">Continue Shopping</Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full sm:w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xl font-bold">${item.price.toFixed(2)}</span>
                        <div className="flex items-center space-x-2">
                          <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">
                            -
                          </button>
                          <span className="px-4">{item.quantity}</span>
                          <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button className="text-red-600 hover:text-red-700 text-sm">
                          Remove
                        </button>
                        <button className="text-primary-600 hover:text-primary-700 text-sm">
                          Save for later
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Coupon Code */}
              <Card>
                <h3 className="font-semibold mb-4">Have a coupon code?</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="flex-1 input-field"
                  />
                  <Button variant="outline">Apply</Button>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <Button variant="primary" className="w-full mb-4">
                  Proceed to Checkout
                </Button>
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Cart;

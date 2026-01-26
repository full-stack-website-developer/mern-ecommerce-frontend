import MainLayout from '../components/layout/MainLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

const Payment = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Cart', href: '/cart' },
            { label: 'Checkout', href: '/checkout' },
            { label: 'Payment', href: '/payment' },
          ]}
        />

        <h1 className="text-3xl font-bold mb-8 mt-4">Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Credit Card */}
            <Card>
              <h2 className="text-xl font-bold mb-6">Credit/Debit Card</h2>
              <div className="space-y-4">
                <Input label="Card Number" placeholder="1234 5678 9012 3456" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Expiry Date" placeholder="MM/YY" />
                  <Input label="CVV" placeholder="123" />
                </div>
                <Input label="Cardholder Name" placeholder="John Doe" />
                <Button variant="primary" className="w-full">Pay $339.98</Button>
              </div>
            </Card>

            {/* PayPal */}
            <Card>
              <h2 className="text-xl font-bold mb-6">PayPal</h2>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="text-4xl mb-4">💳</div>
                <p className="text-gray-600 mb-4">Pay securely with PayPal</p>
                <Button variant="primary" className="w-full">Pay with PayPal</Button>
              </div>
            </Card>

            {/* Stripe */}
            <Card>
              <h2 className="text-xl font-bold mb-6">Stripe</h2>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="text-4xl mb-4">💳</div>
                <p className="text-gray-600 mb-4">Pay securely with Stripe</p>
                <Button variant="primary" className="w-full">Pay with Stripe</Button>
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
                  <span>$299.98</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>$10.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>$30.00</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>$339.98</span>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="success">Secure Payment</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Your payment information is encrypted and secure.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Payment;

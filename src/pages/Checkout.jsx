import MainLayout from '../components/layout/MainLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Radio from '../components/common/Radio';
import Checkbox from '../components/common/Checkbox';

const Checkout = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Cart', href: '/cart' },
            { label: 'Checkout', href: '/checkout' },
          ]}
        />

        <h1 className="text-3xl font-bold mb-8 mt-4">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" placeholder="John" />
                <Input label="Last Name" placeholder="Doe" />
                <Input label="Email" type="email" placeholder="john@example.com" className="md:col-span-2" />
                <Input label="Phone" type="tel" placeholder="+1 234 567 8900" className="md:col-span-2" />
                <Input label="Address" placeholder="123 Main St" className="md:col-span-2" />
                <Input label="City" placeholder="New York" />
                <Input label="State" placeholder="NY" />
                <Input label="ZIP Code" placeholder="10001" />
                <Input label="Country" placeholder="United States" />
              </div>
              <Checkbox label="Save this address for future orders" className="mt-4" />
            </Card>

            {/* Shipping Method */}
            <Card>
              <h2 className="text-xl font-bold mb-6">Shipping Method</h2>
              <div className="space-y-4">
                <Radio name="shipping" value="standard" label="Standard Shipping - $10.00 (5-7 business days)" />
                <Radio name="shipping" value="express" label="Express Shipping - $20.00 (2-3 business days)" />
                <Radio name="shipping" value="overnight" label="Overnight Shipping - $30.00 (Next business day)" />
              </div>
            </Card>

            {/* Payment Method */}
            <Card>
              <h2 className="text-xl font-bold mb-6">Payment Method</h2>
              <div className="space-y-4">
                <Radio name="payment" value="card" label="Credit/Debit Card" />
                <Radio name="payment" value="paypal" label="PayPal" />
                <Radio name="payment" value="stripe" label="Stripe" />
                <Radio name="payment" value="cod" label="Cash on Delivery" />
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
              <Button variant="primary" className="w-full">
                Place Order
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;

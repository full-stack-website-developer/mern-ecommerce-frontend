import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';

const HelpCenter = () => {
  const categories = [
    {
      title: 'Getting Started',
      icon: '🚀',
      topics: ['Account Setup', 'First Purchase', 'Profile Settings', 'Payment Methods'],
    },
    {
      title: 'Orders & Shipping',
      icon: '📦',
      topics: ['Track Order', 'Shipping Options', 'Delivery Times', 'Order Cancellation'],
    },
    {
      title: 'Returns & Refunds',
      icon: '↩️',
      topics: ['Return Policy', 'Refund Process', 'Exchange Items', 'Return Shipping'],
    },
    {
      title: 'Payment & Billing',
      icon: '💳',
      topics: ['Payment Methods', 'Billing Issues', 'Coupons & Discounts', 'Invoice'],
    },
    {
      title: 'Account & Security',
      icon: '🔒',
      topics: ['Password Reset', 'Account Security', 'Privacy Settings', 'Two-Factor Auth'],
    },
    {
      title: 'Products & Reviews',
      icon: '⭐',
      topics: ['Product Questions', 'Write Review', 'Product Availability', 'Warranty'],
    },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-gray-600 mb-8">Search for answers or browse our help topics</p>
          <div className="max-w-2xl mx-auto">
            <SearchBar placeholder="Search for help..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category, index) => (
            <Card key={index} className="hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-bold mb-4">{category.title}</h3>
              <ul className="space-y-2">
                {category.topics.map((topic, topicIndex) => (
                  <li key={topicIndex}>
                    <a href="#" className="text-primary-600 hover:underline text-sm">
                      {topic}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="bg-primary-50 border-primary-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
            <p className="text-gray-600 mb-6">
              Our support team is here to assist you 24/7
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="primary">Contact Support</Button>
              <Button variant="outline">Live Chat</Button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default HelpCenter;

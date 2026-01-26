import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import SearchBar from '../components/common/SearchBar';

const FAQ = () => {
  const faqs = [
    {
      category: 'General',
      questions: [
        {
          q: 'What is your return policy?',
          a: 'We offer a 30-day return policy on all items. Items must be in original condition with tags attached.',
        },
        {
          q: 'How long does shipping take?',
          a: 'Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days.',
        },
        {
          q: 'Do you offer international shipping?',
          a: 'Yes, we ship to over 50 countries worldwide. Shipping costs and times vary by location.',
        },
      ],
    },
    {
      category: 'Orders',
      questions: [
        {
          q: 'How can I track my order?',
          a: 'Once your order ships, you will receive a tracking number via email. You can use this to track your package.',
        },
        {
          q: 'Can I cancel my order?',
          a: 'You can cancel your order within 24 hours of placing it. After that, contact support for assistance.',
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit cards, PayPal, Stripe, and cash on delivery in select areas.',
        },
      ],
    },
    {
      category: 'Account',
      questions: [
        {
          q: 'How do I reset my password?',
          a: 'Click on "Forgot Password" on the login page and enter your email. You will receive a reset link.',
        },
        {
          q: 'Can I change my email address?',
          a: 'Yes, you can update your email address in your account settings under the Profile section.',
        },
        {
          q: 'How do I delete my account?',
          a: 'Contact our support team to request account deletion. This action cannot be undone.',
        },
      ],
    },
    {
      category: 'Products',
      questions: [
        {
          q: 'Are products authentic?',
          a: 'Yes, all our products are 100% authentic and come with manufacturer warranties.',
        },
        {
          q: 'Do you offer product warranties?',
          a: 'Most products come with manufacturer warranties. Check individual product pages for warranty details.',
        },
        {
          q: 'Can I request a specific product?',
          a: 'Yes, contact our support team with product details and we will do our best to source it for you.',
        },
      ],
    },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-8">Find answers to common questions</p>
          <div className="max-w-2xl mx-auto">
            <SearchBar placeholder="Search FAQs..." />
          </div>
        </div>

        <div className="space-y-8">
          {faqs.map((section, sectionIndex) => (
            <Card key={sectionIndex}>
              <h2 className="text-2xl font-bold mb-6">{section.category}</h2>
              <div className="space-y-4">
                {section.questions.map((faq, faqIndex) => (
                  <div key={faqIndex} className="border-b border-gray-200 pb-4 last:border-0">
                    <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-12 bg-primary-50 border-primary-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Contact our support team.
            </p>
            <a href="/help" className="text-primary-600 hover:underline font-medium">
              Contact Support →
            </a>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default FAQ;

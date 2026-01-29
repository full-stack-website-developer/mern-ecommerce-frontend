import Rating from '../common/Rating';
import Button from '../common/Button';

const ProductReviews = () => {
  const reviews = [
    {
      id: 1,
      user: 'John Doe',
      rating: 5,
      date: '2026-01-15',
      comment: 'Excellent product! Very satisfied with my purchase.',
    },
    {
      id: 2,
      user: 'Jane Smith',
      rating: 4,
      date: '2026-01-10',
      comment: 'Good quality, fast shipping. Would recommend.',
    },
    {
      id: 3,
      user: 'Bob Johnson',
      rating: 5,
      date: '2026-01-05',
      comment: 'Amazing product, exceeded my expectations!',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Customer Reviews</h3>
        <Button variant="primary">Write a Review</Button>
      </div>

      {/* Review Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">4.8</div>
            <Rating rating={4.8} size="lg" />
            <div className="text-sm text-gray-600 mt-2">Based on 120 reviews</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">5 stars</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <span className="text-sm text-gray-600">80%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">4 stars</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
              <span className="text-sm text-gray-600">15%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">3 stars</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '3%' }}></div>
              </div>
              <span className="text-sm text-gray-600">3%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">2 stars</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '1%' }}></div>
              </div>
              <span className="text-sm text-gray-600">1%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">1 star</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '1%' }}></div>
              </div>
              <span className="text-sm text-gray-600">1%</span>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Button variant="primary">Write a Review</Button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold">{review.user}</div>
                <div className="text-sm text-gray-600">{review.date}</div>
              </div>
              <Rating rating={review.rating} />
            </div>
            <p className="text-gray-700 mt-2">{review.comment}</p>
            <div className="flex space-x-4 mt-4 text-sm text-gray-600">
              <button className="hover:text-primary-600">Helpful (12)</button>
              <button className="hover:text-primary-600">Reply</button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline">Load More Reviews</Button>
      </div>
    </div>
  );
};

export default ProductReviews;

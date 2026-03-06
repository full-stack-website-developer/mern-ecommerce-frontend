import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Pagination from '../common/Pagination';
import Rating from '../common/Rating';
import Skeleton from '../common/Skeleton';
import Textarea from '../common/Textarea';
import { formatDate } from '../../utils/date';
import reviewService from '../../services/review.service';
import useUserContext from '../../hooks/useUserContext';

const PAGE_SIZE = 5;
const DEFAULT_DISTRIBUTION = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

const ProductReviews = ({ productId }) => {
  const navigate = useNavigate();
  const { user } = useUserContext();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0, distribution: DEFAULT_DISTRIBUTION });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 });

  const [form, setForm] = useState({
    rating: 0,
    title: '',
    body: '',
  });

  const fetchReviews = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    try {
      const res = await reviewService.getProductReviews(productId, { page, limit: PAGE_SIZE });
      if (!res?.success) {
        return;
      }

      setReviews(res.data?.reviews || []);
      setStats({
        avgRating: res.data?.stats?.avgRating || 0,
        totalReviews: res.data?.stats?.totalReviews || 0,
        distribution: res.data?.stats?.distribution || DEFAULT_DISTRIBUTION,
      });
      setPagination(res.data?.pagination || { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 });
    } catch (error) {
      toast.error(error?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [productId, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    setPage(1);
  }, [productId]);

  const distributionRows = useMemo(() => {
    const total = Number(stats.totalReviews) || 0;
    const distribution = stats.distribution || DEFAULT_DISTRIBUTION;

    return [5, 4, 3, 2, 1].map((star) => {
      const count = Number(distribution[star]) || 0;
      const percentage = total ? Math.round((count / total) * 100) : 0;

      return { star, count, percentage };
    });
  }, [stats]);

  const handleOpenReviewModal = () => {
    if (!user?.id && !user?._id) {
      toast.error('Please login to write a review');
      navigate('/login');
      return;
    }
    setIsModalOpen(true);
  };

  const handleCreateReview = async (event) => {
    event.preventDefault();

    if (!form.rating) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        productId,
        rating: form.rating,
        title: form.title,
        body: form.body,
      };

      const res = await reviewService.createReview(payload);

      if (res?.success) {
        toast.success('Review submitted successfully');
        setIsModalOpen(false);
        setForm({ rating: 0, title: '', body: '' });
        if (page === 1) {
          fetchReviews();
        } else {
          setPage(1);
        }
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl font-bold">Customer Reviews</h3>
        <Button variant="primary" onClick={handleOpenReviewModal}>Write a Review</Button>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{(stats.avgRating || 0).toFixed(1)}</div>
            <div className="flex justify-center">
              <Rating rating={Math.round(stats.avgRating || 0)} size="lg" />
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Based on {stats.totalReviews || 0} review{stats.totalReviews === 1 ? '' : 's'}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            {distributionRows.map((row) => (
              <div key={row.star} className="flex items-center gap-2">
                <span className="text-sm w-14">{row.star} stars</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${row.percentage}%` }} />
                </div>
                <span className="text-sm text-gray-600 w-14 text-right">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          description="Be the first customer to review this product."
        />
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => {
            const fullName = `${review?.userId?.firstName || ''} ${review?.userId?.lastName || ''}`.trim() || 'Anonymous';
            return (
              <div key={review._id} className="border-b border-gray-200 pb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Avatar src={review?.userId?.avatar?.url} name={fullName} />
                    <div>
                      <div className="font-semibold">{fullName}</div>
                      <div className="text-sm text-gray-600">{formatDate(review.createdAt)}</div>
                    </div>
                  </div>
                  <Rating rating={review.rating} />
                </div>

                {review.title && (
                  <h4 className="font-semibold text-gray-900 mt-3">{review.title}</h4>
                )}

                {review.body && (
                  <p className="text-gray-700 mt-2">{review.body}</p>
                )}

                {review.isVerifiedPurchase && (
                  <div className="mt-3">
                    <Badge variant="success" className="text-xs px-2.5 py-1">Verified Purchase</Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Write a Review" size="md">
        <form className="space-y-4" onSubmit={handleCreateReview}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, rating: star }))}
                  className="p-1"
                >
                  <svg
                    className={`w-7 h-7 ${star <= form.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Review Title"
            placeholder="Summarize your experience"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            maxLength={120}
          />

          <Textarea
            label="Review"
            placeholder="Share details about the product quality, fit, delivery, etc."
            rows={4}
            value={form.body}
            onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
            maxLength={1000}
          />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeModal} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductReviews;

import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import useWishlistContext from '../../hooks/useWishlistContext';
import { formatDisplayPrice } from '../../utils/price';
import { useMemo, useState } from 'react';

const Wishlist = () => {
  const {
    wishlistItems,
    wishlistLoading,
    wishlistCount,
    moveToSaveForLater,
    removeFromWishlist,
    clearWishlist,
  } = useWishlistContext();

  const handleRemove = async (productId) => {
    const success = await removeFromWishlist(productId);
    if (!success) {
      toast.error('Failed to remove item');
      return;
    }
    toast.success('Removed from wishlist');
  };

  const handleMoveToSaveForLater = async (productId) => {
    const success = await moveToSaveForLater(productId);
    if (!success) {
      toast.error('Failed to move item');
      return;
    }
    toast.success('Saved for later');
  };

  const handleClear = async () => {
    const success = await clearWishlist();
    if (!success) {
      toast.error('Failed to clear wishlist');
      return;
    }
    toast.success('Wishlist cleared');
  };

  const [page, setPage] = useState(1);
  const PER_PAGE = 8;
  const totalPages = useMemo(() => Math.max(1, Math.ceil((wishlistItems || []).length / PER_PAGE)), [wishlistItems]);
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return (wishlistItems || []).slice(start, start + PER_PAGE);
  }, [wishlistItems, page]);


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2"><Heart className="w-7 h-7 text-red-500" /> My Wishlist</h1>
          <Button variant="outline" onClick={handleClear} disabled={wishlistCount === 0}>Clear All</Button>
        </div>

        {wishlistLoading ? (
          <Card><p className="text-center text-gray-500 py-8">Loading wishlist...</p></Card>
        ) : wishlistItems.length === 0 ? (
          <Card>
            <EmptyState
              icon="❤️"
              title="Your wishlist is empty"
              description="Start adding products you love to your wishlist."
            />
          </Card>
        ) : (
          <Card>
            <div className="mb-4 text-gray-600">You have {wishlistCount} item(s) in your wishlist</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedItems.map((item) => {
                const product = item.productId;
                return (
                  <div key={item._id} className="border rounded-lg p-4 flex gap-4">
                    <img
                      src={product?.mainImage?.url || product?.mainImage || 'https://via.placeholder.com/120'}
                      alt={product?.name}
                      className="w-24 h-24 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{product?.name || 'Product'}</h3>
                      <p className="text-sm text-gray-500 mb-2">${formatDisplayPrice(product)}</p>
                      <div className="flex gap-2">
                        <Link to={`/products/${product?._id}`}><Button size="sm" variant="ghost">View</Button></Link>
                        <Button size="sm" variant="outline" onClick={() => handleMoveToSaveForLater(product?._id)}>Save for later</Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleRemove(product?._id)}>Remove</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                scrollToTop
              />
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Wishlist;

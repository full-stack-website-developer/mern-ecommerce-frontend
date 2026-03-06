import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bookmark } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import useWishlistContext from '../../hooks/useWishlistContext';
import { formatDisplayPrice } from '../../utils/price';

const SaveForLater = () => {
  const {
    savedForLaterItems,
    saveForLaterLoading,
    savedForLaterCount,
    moveToWishlist,
    removeFromSavedForLater,
    clearSavedForLater,
  } = useWishlistContext();

  const handleRemove = async (productId) => {
    const success = await removeFromSavedForLater(productId);
    if (!success) {
      toast.error('Failed to remove item');
      return;
    }
    toast.success('Removed from saved items');
  };

  const handleMoveToWishlist = async (productId) => {
    const success = await moveToWishlist(productId);
    if (!success) {
      toast.error('Failed to move item');
      return;
    }
    toast.success('Moved to wishlist');
  };

  const handleClear = async () => {
    const success = await clearSavedForLater();
    if (!success) {
      toast.error('Failed to clear saved items');
      return;
    }
    toast.success('Saved items cleared');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2"><Bookmark className="w-7 h-7 text-primary-600" /> Save For Later</h1>
          <Button variant="outline" onClick={handleClear} disabled={savedForLaterCount === 0}>Clear All</Button>
        </div>

        {saveForLaterLoading ? (
          <Card><p className="text-center text-gray-500 py-8">Loading saved items...</p></Card>
        ) : savedForLaterItems.length === 0 ? (
          <Card>
            <EmptyState
              icon="🔖"
              title="No saved items"
              description="Products you save for later will appear here."
            />
          </Card>
        ) : (
          <Card>
            <div className="mb-4 text-gray-600">You have {savedForLaterCount} saved item(s)</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedForLaterItems.map((item) => {
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
                        <Button size="sm" variant="outline" onClick={() => handleMoveToWishlist(product?._id)}>Move to Wishlist</Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleRemove(product?._id)}>Remove</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SaveForLater;

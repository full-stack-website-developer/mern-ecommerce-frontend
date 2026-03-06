import { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import useCartContext from '../hooks/useCartContext';
import QuantityInput from '../components/common/QuantityInput';
import { Link } from 'react-router-dom';
import useUserContext from '../hooks/useUserContext';
import useWishlistContext from '../hooks/useWishlistContext';
import toast from 'react-hot-toast';
import { Bookmark, Heart, Trash2 } from 'lucide-react';
import usePlatformSettings from '../hooks/usePlatformSettings';

const Cart = () => {
  const { cartItems, updateQuantity, deleteItem, normalizeId } = useCartContext();
  const { user } = useUserContext();
  const { moveToSaveForLater, moveToWishlist } = useWishlistContext();
  const { settings } = usePlatformSettings();
  const [lineActionLoading, setLineActionLoading] = useState({});

  function displayName(item) {
    const productName = item.productId?.name || "Unknown Product";
  
    const variantName = item.variantId?.options
      ?.map(opt => (opt.selectedValue?.label || ""))
      .join(" / ") || "";
  
    return variantName ? `${productName} - ${variantName}` : productName;
  }

  async function removeFromCartLine(item) {
    await deleteItem(
      item._id || normalizeId(item.productId),
      item.variantId ? normalizeId(item.variantId) : null
    );
  }

  async function saveForLater(item) {
    if (!user?.id) {
      toast.error('Please login to use save for later');
      return;
    }

    const productId = normalizeId(item.productId);
    if (!productId) return;

    const success = await moveToSaveForLater(productId);
    if (!success) {
      toast.error('Failed to save item for later');
      return;
    }

    await removeFromCartLine(item);
    toast.success('Saved for later');
  }

  async function moveLineToWishlist(item) {
    if (!user?.id) {
      toast.error('Please login to manage wishlist');
      return;
    }

    const productId = normalizeId(item.productId);
    if (!productId) return;

    const success = await moveToWishlist(productId);
    if (!success) {
      toast.error('Failed to move item to wishlist');
      return;
    }

    await removeFromCartLine(item);
    toast.success('Moved to wishlist');
  }

  async function handleLineAction(item, action) {
    const lineId = item?._id || normalizeId(item.productId);
    setLineActionLoading((prev) => ({ ...prev, [lineId]: true }));
    try {
      await action(item);
    } finally {
      setLineActionLoading((prev) => ({ ...prev, [lineId]: false }));
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= Number(settings.freeShippingThreshold || 0)
    ? 0
    : Number(settings.defaultShippingCost || 0);
  const tax = subtotal * (Number(settings.taxRate || 0) / 100);
  const total = subtotal + shipping + tax;
  const formatMoney = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: settings.currency || 'USD',
  }).format(value || 0);

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
                <Card key={item._id || item.id || normalizeId(item.productId)} className="relative group">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={item?.productId?.mainImage?.url}
                      alt={item.name}
                      className="w-full sm:w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{displayName(item)}</h3>
                        <p className="text-xl font-bold">{formatMoney(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-pink-50 transition-colors flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                          onClick={() => handleLineAction(item, moveLineToWishlist)}
                          disabled={lineActionLoading[item?._id || normalizeId(item.productId)]}
                          title="Move to wishlist"
                          aria-label="Move to wishlist"
                        >
                          <Heart className="w-4 h-4 text-gray-700 hover:text-pink-600 transition-colors" />
                        </button>
                        <button
                          type="button"
                          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-blue-50 transition-colors flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                          onClick={() => handleLineAction(item, saveForLater)}
                          disabled={lineActionLoading[item?._id || normalizeId(item.productId)]}
                          title="Save for later"
                          aria-label="Save for later"
                        >
                          <Bookmark className="w-4 h-4 text-gray-700 hover:text-blue-600 transition-colors" />
                        </button>
                        {/* <QuantityInput item={item} onUpdate={updateQuantity} /> */}
                      </div>
                    </div>

                    <div className="sm:w-[140px] flex sm:flex-col items-center sm:items-end justify-between gap-3">
                      <button
                        type="button"
                        className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-red-50 transition-colors flex items-center justify-center"
                        onClick={() => removeFromCartLine(item)}
                        title="Remove"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600 transition-colors" />
                      </button>


                      <QuantityInput item={item} onUpdate={updateQuantity} />
                    </div>
                  </div>
                </Card>
              ))}

            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatMoney(shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({Number(settings.taxRate || 0)}%)</span>
                    <span>{formatMoney(tax)}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatMoney(total)}</span>
                  </div>
                </div>
                <Link to={'/checkout'}>
                  <Button 
                    variant="primary" 
                    className="w-full mb-4"
                  >
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link to={'/'}>
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Cart;

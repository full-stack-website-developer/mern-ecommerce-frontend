import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Bookmark, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import Rating from '../common/Rating';
import Badge from '../common/Badge';
import Button from '../common/Button';
import useCartContext from '../../hooks/useCartContext';
import VariantModal from '../../features/product/components/VariantModal';
import useUserContext from '../../hooks/useUserContext';
import useWishlistContext from '../../hooks/useWishlistContext';
import { formatDisplayPrice, getDisplayPrice } from '../../utils/price';

const ProductCard = ({ product, showFlashCountdown = false, viewMode = 'grid' }) => {
  const { addToCart } = useCartContext();
  const { user } = useUserContext();
  const { isInWishlist, toggleWishlist, moveToSaveForLater } = useWishlistContext();
  const navigate = useNavigate();

  const [activeVariant, setActiveVariant] = useState(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isSaveForLaterLoading, setIsSaveForLaterLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  const productId = product?.id || product?._id;
  const isWishlisted = isInWishlist(productId);
  const avgRating = Number(product?.reviewSummary?.avgRating) || 0;
  const totalReviews = Number(product?.reviewSummary?.totalReviews) || 0;
  const flashSaleEnd = product?.flashSale?.endAt ? new Date(product.flashSale.endAt).getTime() : null;
  const flashSaleStart = product?.flashSale?.startAt ? new Date(product.flashSale.startAt).getTime() : null;
  const basePrice = Number(product?.price) || 0;
  const discount = Number(product?.discount) || 0;
  const regularPrice = discount > 0
    ? Number((basePrice * (1 - discount / 100)).toFixed(2))
    : basePrice;
  const isFlashSaleActive = Boolean(
    product?.flashSale?.isActive &&
    Number(product?.flashSale?.salePrice) > 0 &&
    flashSaleEnd &&
    flashSaleEnd > now &&
    (!flashSaleStart || flashSaleStart <= now)
  );
  const displayPrice = isFlashSaleActive
    ? Number(product?.flashSale?.salePrice)
    : (Number(product?.effectivePrice) || getDisplayPrice(product));

  useEffect(() => {
    if (!showFlashCountdown || !isFlashSaleActive) {
      return undefined;
    }

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [showFlashCountdown, isFlashSaleActive]);

  const countdownLabel = (() => {
    if (!isFlashSaleActive || !showFlashCountdown || !flashSaleEnd) {
      return null;
    }

    const remainingMs = flashSaleEnd - now;
    if (remainingMs <= 0) return 'Ended';

    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  })();

  function handleAddToCart(id) {
    if (product?.hasVariants) {
      setIsVariantModalOpen(true);
      return;
    }

    const price = activeVariant?.price ?? getDisplayPrice(product);
    addToCart({
      productId: id,
      variantId: null,
      sellerId: product?.sellerId?._id || product?.sellerId || null,
      quantity: 1,
      price,
    });
  }

  function handleConfirmVariant(variant) {
    addToCart({
      productId,
      variantId: variant._id,
      sellerId: product?.sellerId?._id || product?.sellerId || null,
      quantity: 1,
      price: variant.price,
    });
    setActiveVariant(variant);
    setIsVariantModalOpen(false);
  }

  async function handleWishlistToggle(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!productId) return;
    if (!user?.id) {
      toast.error('Please login to manage wishlist');
      navigate('/login');
      return;
    }
    if (isWishlistLoading) return;

    try {
      setIsWishlistLoading(true);
      const wasWishlisted = isWishlisted;
      const success = await toggleWishlist(productId);
      if (!success) {
        toast.error('Failed to update wishlist');
        return;
      }
      toast.success(wasWishlisted ? 'Removed from wishlist' : 'Moved to wishlist');
    } finally {
      setIsWishlistLoading(false);
    }
  }

  async function handleSaveForLater(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!productId) return;
    if (!user?.id) {
      toast.error('Please login to save items');
      navigate('/login');
      return;
    }
    if (isSaveForLaterLoading) return;

    try {
      setIsSaveForLaterLoading(true);
      const success = await moveToSaveForLater(productId);
      if (!success) {
        toast.error('Failed to save for later');
        return;
      }
      toast.success('Saved for later');
    } finally {
      setIsSaveForLaterLoading(false);
    }
  }

  // List view layout
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        {isVariantModalOpen && (
          <VariantModal
            product={product}
            onClose={() => setIsVariantModalOpen(false)}
            onConfirm={handleConfirmVariant}
          />
        )}

        <div className="flex">
          <Link to={`/products/${productId || '1'}`} className="flex-shrink-0">
            <div className="relative w-48 h-48">
              <img
                src={product?.image || 'https://via.placeholder.com/300x300'}
                alt={product?.name || 'Product'}
                className="w-full h-full object-cover"
              />
              {isFlashSaleActive ? (
                <Badge variant="danger" className="absolute top-2 left-2 bg-red-600 text-white">
                  SALE
                </Badge>
              ) : product?.discount ? (
                <Badge variant="danger" className="absolute top-2 left-2">
                  -{product.discount}%
                </Badge>
              ) : null}
              {product?.isNew ? (
                <Badge variant="success" className="absolute top-2 right-2">
                  New
                </Badge>
              ) : null}
            </div>
          </Link>

          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <Link to={`/products/${productId || '1'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary-600">
                  {product?.name || 'Product Name'}
                </h3>
              </Link>

              <div className="flex items-center space-x-2 mb-3">
                <Rating rating={Math.round(avgRating)} />
                <span className="text-sm text-gray-500">({totalReviews} reviews)</span>
              </div>

              {product?.shortDescription && (
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {product.shortDescription}
                </p>
              )}

              {countdownLabel && (
                <div className="mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    Ends in {countdownLabel}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`text-2xl font-bold ${isFlashSaleActive ? 'text-red-600' : 'text-gray-900'}`}>
                  ${Number.isFinite(displayPrice) ? displayPrice.toFixed(2) : formatDisplayPrice(product)}
                </span>
                {isFlashSaleActive ? (
                  <span className="text-lg text-gray-500 line-through">
                    ${regularPrice.toFixed(2)}
                  </span>
                ) : product?.originalPrice ? (
                  <span className="text-lg text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleWishlistToggle}
                  disabled={isWishlistLoading}
                  className="p-2"
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'text-red-500 fill-red-500' : ''}`} />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveForLater}
                  disabled={isSaveForLaterLoading}
                  className="p-2"
                  aria-label="Save for later"
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
                <Button variant="primary" onClick={() => handleAddToCart(productId)}>
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view layout (default)
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      {isVariantModalOpen && (
        <VariantModal
          product={product}
          onClose={() => setIsVariantModalOpen(false)}
          onConfirm={handleConfirmVariant}
        />
      )}

      <Link to={`/products/${productId || '1'}`}>
        <div className="relative">
          <img
            src={product?.image || 'https://via.placeholder.com/300x300'}
            alt={product?.name || 'Product'}
            className="w-full h-64 object-cover"
          />
          {isFlashSaleActive ? (
            <Badge variant="danger" className="absolute top-2 left-2 bg-red-600 text-white">
              SALE
            </Badge>
          ) : product?.discount ? (
            <Badge variant="danger" className="absolute top-2 left-2">
              -{product.discount}%
            </Badge>
          ) : null}
          {product?.isNew ? (
            <Badge variant="success" className="absolute top-2 right-14">
              New
            </Badge>
          ) : null}

          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 disabled:opacity-60"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${productId || '1'}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600">
            {product?.name || 'Product Name'}
          </h3>
        </Link>

        <div className="flex items-center space-x-2 mb-2">
          <Rating rating={Math.round(avgRating)} />
          <span className="text-sm text-gray-500">({totalReviews})</span>
        </div>

        {countdownLabel ? (
          <div className="mb-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              Ends in {countdownLabel}
            </span>
          </div>
        ) : null}

        <div className="flex items-center space-x-2 mb-4">
          <span className={`text-2xl font-bold ${isFlashSaleActive ? 'text-red-600' : 'text-gray-900'}`}>
            ${Number.isFinite(displayPrice) ? displayPrice.toFixed(2) : formatDisplayPrice(product)}
          </span>
          {isFlashSaleActive ? (
            <span className="text-lg text-gray-500 line-through">
              ${regularPrice.toFixed(2)}
            </span>
          ) : product?.originalPrice ? (
            <span className="text-lg text-gray-500 line-through">
              ${product.originalPrice}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="primary" className="w-full" onClick={() => handleAddToCart(productId)}>
            Add to Cart
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleWishlistToggle}
              disabled={isWishlistLoading}
              className="flex items-center justify-center gap-2"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'text-red-500 fill-red-500' : ''}`} />
              Wishlist
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveForLater}
              disabled={isSaveForLaterLoading}
              className="flex items-center justify-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

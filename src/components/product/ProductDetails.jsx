import { useEffect, useState, useContext } from 'react';
import Rating from '../common/Rating';
import Badge from '../common/Badge';
import Button from '../common/Button';
import ProductImageGallery from './ProductImageGallery';
import { CartContext } from '../../store/cartContext';
import QuantityInput from '../../features/product/components/QuantityInput';
import ContactSellerButton from '../chat/ContactSellerButton';
import toast from 'react-hot-toast';
import useUserContext from '../../hooks/useUserContext';
import useWishlistContext from '../../hooks/useWishlistContext';
import { Link, useNavigate } from 'react-router-dom';
import { getDisplayPrice } from '../../utils/price';
import { Heart } from 'lucide-react';
import dashboardService from '../../services/dashboard.service';
import { formatDate } from '../../utils/date';

const ProductDetails = ({ productData }) => {
  const product = productData?.product || null;
  const variants = Array.isArray(product?.variants) ? product.variants : [];

  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [activeVariant, setActiveVariant] = useState(null);
  const [isWishlistActionLoading, setIsWishlistActionLoading] = useState(false);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(false);
  const { addToCart } = useContext(CartContext);
  const { user } = useUserContext();
  const { isInWishlist, toggleWishlist } = useWishlistContext();
  const navigate = useNavigate();

  useEffect(() => {
    const productId = product?._id;
    if (!productId) return;

    const storageKey = 'recentlyViewedProductIds';
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const normalized = Array.isArray(existing) ? existing.map(String) : [];

    const next = [String(productId), ...normalized.filter((id) => id !== String(productId))].slice(0, 24);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }, [product?._id]);

  // Initialize default selection: use first real variant combo when possible
  useEffect(() => {
    if (!product?.options?.length) return;

    // If we have real variants, use the first variant's combination as default
    if (Array.isArray(variants) && variants.length > 0) {
      const first = variants[0];
      const defaultsFromVariant = (first.options || []).map((opt) => ({
        optionId: String(opt.optionId),
        selectedValue: String(opt.valueId),
      }));
      if (defaultsFromVariant.length > 0) {
        setSelectedVariants(defaultsFromVariant);
        return;
      }
    }

    const defaults = product.options
      .map((opt) => {
        const optionDoc = opt?.optionId;
        const optionId = optionDoc?._id ? String(optionDoc._id) : null;
        if (!optionId) return null;

        const chosenIds = (opt.values || []).map((v) =>
          typeof v === 'string' ? v : v?._id?.toString?.() || v?.toString?.()
        );

        const firstChosenId = chosenIds[0];
        const fallbackId = optionDoc?.values?.[0]?._id?.toString?.();
        const selectedValue = firstChosenId || fallbackId;

        if (!selectedValue) return null;
        return { optionId, selectedValue };
      })
      .filter(Boolean);

    setSelectedVariants(defaults);
  }, [product?.options]);

  useEffect(() => {
    if (!variants?.length || !selectedVariants.length) return;

    const match = variants.find(variant =>
      selectedVariants.every(sel =>
        variant.options.some(opt =>
          String(opt.optionId) === sel.optionId &&
          String(opt.valueId) === sel.selectedValue
        )
      )
    );

    setActiveVariant(match || null);
  }, [selectedVariants, variants]);

  useEffect(() => {
    const sellerId = product?.sellerId?._id;
    if (!sellerId) {
      setSellerProfile(null);
      return;
    }

    let isActive = true;
    (async () => {
      try {
        setSellerLoading(true);
        const res = await dashboardService.getPublicSellerProfile(sellerId);
        if (!isActive) return;
        if (res?.success) {
          setSellerProfile(res.data?.profile || null);
        }
      } catch {
        if (isActive) setSellerProfile(null);
      } finally {
        if (isActive) setSellerLoading(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [product?.sellerId?._id]);

  const optionCount = Array.isArray(product?.options) ? product.options.length : 0;
  const hasAllSelections =
    product?.hasVariants &&
    optionCount > 0 &&
    selectedVariants.length === optionCount &&
    selectedVariants.every((sel) =>
      product.options.some(
        (opt) => String(opt.optionId?._id ?? opt.optionId) === sel.optionId
      )
    );

  const noMatchingVariant =
    product?.hasVariants &&
    hasAllSelections &&
    !activeVariant &&
    Array.isArray(variants) &&
    variants.length > 0;

  const price = activeVariant?.price ?? getDisplayPrice(product);
  const availableStock = activeVariant?.quantity ?? product?.quantity ?? 9999;
  const avgRating = Number(product?.reviewSummary?.avgRating) || 0;
  const totalReviews = Number(product?.reviewSummary?.totalReviews) || 0;

  function handleVariantsSelection(optionId, valueId) {
    const variant = { optionId, selectedValue: valueId };

    if (selectedVariants.some(v => v.optionId === variant.optionId)) {
      setSelectedVariants(selectedVariants.map(v => v.optionId === variant.optionId ? variant : v));
      return;
    }

    setSelectedVariants(prev => [...prev, variant]);
  }

  function handleAddToCart(productId) {
    if (product?.hasVariants && !activeVariant) {
      toast.error('Please select all options before adding to cart');
      return;
    }

    const item = {
      productId,
      variantId: activeVariant?._id || null,
      sellerId: product?.sellerId?._id || null,
      quantity,
      price,
    };

    addToCart(item);
  }

  async function handleWishlistToggle() {
    const productId = product?._id;
    if (!productId) return;

    if (!user?.id) {
      toast.error('Please login to manage wishlist');
      navigate('/login');
      return;
    }

    if (isWishlistActionLoading) return;

    try {
      setIsWishlistActionLoading(true);
      const wishlisted = isInWishlist(productId);
      const success = await toggleWishlist(productId);

      if (!success) throw new Error();
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setIsWishlistActionLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product Images */}
      <div>
        <ProductImageGallery images={[ product?.mainImage, ...product?.additionalImages ]}/>
      </div>

      {/* Product Info */}
      <div>
        <div className="mb-4">
          <Badge variant="success">In Stock</Badge>
          <Badge variant="primary" className="ml-2">Best Seller</Badge>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {product?.name || 'Product Name'}
        </h1>

        <div className="flex items-center space-x-4 mb-4">
          <Rating rating={Math.round(avgRating)} showNumber size="lg" />
          <span className="text-gray-600">({totalReviews} reviews)</span>
          <a href="#reviews" className="text-primary-600 hover:underline">
            See all reviews
          </a>
        </div>

        <div className="mb-6">
          {noMatchingVariant ? (
            <div className="flex flex-col space-y-1">
              <span className="text-2xl font-semibold text-gray-500">Not available</span>
              <span className="text-sm text-gray-500">
                This combination of options is not available. Please choose a different combination.
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-gray-900">
                ${price ?? '—'}
              </span>
              {product?.originalPrice && (
                <>
                  <span className="text-2xl text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                  <Badge variant="danger">
                    Save {Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </Badge>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-gray-700">
            {product?.description || 'This is a high-quality product with excellent features. Perfect for everyday use and built to last.'}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4 mb-6">
          {product?.hasVariants &&
            product?.options.map((opt) => {
              const optionDoc = opt?.optionId;
              if (!optionDoc?._id) return null;

              const optionId = String(optionDoc._id);
              const chosenSet = new Set(
                (opt.values || []).map((v) =>
                  typeof v === 'string' ? v : v?._id?.toString?.() || v?.toString?.()
                )
              );

              const displayValues = Array.isArray(optionDoc.values)
                ? optionDoc.values.filter((v) =>
                    chosenSet.size === 0 || chosenSet.has(v._id?.toString?.())
                  )
                : [];

              return (
                <div key={optionId}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {optionDoc.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {displayValues.map((val) => {
                      const valueId = val._id?.toString?.();
                      if (!valueId) return null;

                      const isSelected = selectedVariants.some(
                        (v) =>
                          v.optionId === optionId &&
                          v.selectedValue === valueId
                      );

                      return (
                        <button
                          key={valueId}
                          className={`px-4 py-2 border-2 rounded-lg hover:border-primary-600 transition-colors ${
                            isSelected
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-300'
                          }`}
                          onClick={() =>
                            handleVariantsSelection(optionId, valueId)
                          }
                          type="button"
                        >
                          {val.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          }

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <QuantityInput
              value={quantity}
              onChange={setQuantity}
              max={availableStock}
            />
            {availableStock < 10 && availableStock > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Only {availableStock} left in stock
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4 mb-6">
          <Button
            variant="primary"
            className="flex-1"
            disabled={product?.hasVariants && !activeVariant}
            onClick={() => handleAddToCart(product?._id)}
          >
            Add to Cart
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleWishlistToggle}
            disabled={isWishlistActionLoading}
            aria-label={isInWishlist(product?._id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-6 h-6 ${isInWishlist(product?._id) ? 'text-red-500 fill-red-500' : ''}`} />
          </Button>
        </div>

        <div className="flex space-x-4 mb-6">
          <ContactSellerButton sellerId={product?.sellerId?._id} sellerName={product?.sellerId?.storeName}/>
        </div>

        <div className="border border-gray-200 rounded-xl p-4 mb-6 bg-white">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Seller Information</h3>
          {sellerLoading ? (
            <div className="space-y-2">
              <div className="h-4 w-44 rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
              <div className="h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
            </div>
          ) : (
            <div className="space-y-2 text-sm text-gray-700">
              <p className="font-medium text-gray-900">
                {sellerProfile?.storeName || product?.sellerId?.storeName || 'Seller'}
              </p>
              <p>
                {sellerProfile?.storeDescription || 'Trusted seller on our marketplace.'}
              </p>
              {sellerProfile?.businessAddress && (
                <p className="text-gray-600">Address: {sellerProfile.businessAddress}</p>
              )}
              {sellerProfile?.memberSince && (
                <p className="text-gray-500">Member since {formatDate(sellerProfile.memberSince)}</p>
              )}
              {sellerProfile?.status === 'approved' && sellerProfile?.storeSlug && (
                <Link
                  to={`/store/${sellerProfile.storeSlug}`}
                  className="inline-flex text-primary-600 hover:underline font-medium"
                >
                  Visit Store
                </Link>
              )}
              {sellerProfile?.status && sellerProfile.status !== 'approved' && (
                <p className="text-xs text-amber-600">Store page will be available after seller approval.</p>
              )}
            </div>
          )}
        </div>

        {/* Shipping Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          {[
            'Free shipping on orders over $50',
            '30-day return policy',
            'Secure payment',
          ].map(text => (
            <div key={text} className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

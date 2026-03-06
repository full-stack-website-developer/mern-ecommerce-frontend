import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProductList from '../components/product/ProductList';
import CategoryGrid from '../components/category/CategoryGrid';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import useProducts from '../features/product/hooks/useProducts';
import FullPageLoader from '../components/common/FullPageLoader';
import dashboardService from '../services/dashboard.service';
import Avatar from '../components/common/Avatar';
import productService from '../services/product.service';
import useWishlistContext from '../hooks/useWishlistContext';
import useCartContext from '../hooks/useCartContext';

const fallbackCms = {
  hero: {
    badgeText: 'New Collection 2026',
    title: 'Shop the Latest Trends',
    subtitle: 'Discover amazing products at unbeatable prices. Free shipping on orders over $50.',
    primaryButtonText: 'Shop Now',
    primaryButtonLink: '/products',
    secondaryButtonText: 'Flash Sales',
    secondaryButtonLink: '/products',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1400&auto=format&fit=crop',
    startColor: '#2563eb',
    endColor: '#1e3a8a',
  },
  promos: [],
  newsletter: {
    title: 'Subscribe to Our Newsletter',
    subtitle: 'Get the latest updates on new products and upcoming sales',
    placeholder: 'Enter your email',
    buttonText: 'Subscribe',
  },
  sections: {
    hero: true,
    flashSales: true,
    categories: true,
    featuredProducts: true,
    recommendedProducts: true,
    recentlyViewed: true,
    newsletter: true,
  },
};

const Home = () => {
  const { products, loading } = useProducts();
  const { wishlistItems = [] } = useWishlistContext();
  const { cartItems = [] } = useCartContext();
  const [cms, setCms] = useState(fallbackCms);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await dashboardService.getPublicCms();
        if (res?.success && res?.data?.cms) {
          const incoming = res.data.cms;
          setCms({
            ...fallbackCms,
            ...incoming,
            hero: { ...fallbackCms.hero, ...(incoming.hero || {}) },
            newsletter: { ...fallbackCms.newsletter, ...(incoming.newsletter || {}) },
            sections: { ...fallbackCms.sections, ...(incoming.sections || {}) },
          });
        }
      } catch($err) {
        console.log('Error while fetching CMS : ' + $err)
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await productService.getFlashSaleProducts();
        if (res?.success) {
          setFlashSaleProducts(res.data || []);
        }
      } catch {
        setFlashSaleProducts([]);
      }
    })();
  }, []);

  const sections = cms.sections || fallbackCms.sections;
  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);
  const recentlyViewedProducts = useMemo(() => {
    const viewedIds = JSON.parse(localStorage.getItem('recentlyViewedProductIds') || '[]');
    const ids = Array.isArray(viewedIds) ? viewedIds.map(String) : [];
    const byId = new Map(products.map((product) => [String(product?.id || product?._id), product]));

    return ids
      .map((id) => byId.get(id))
      .filter(Boolean)
      .slice(0, 8);
  }, [products]);

  const recommendedProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];

    const getId = (product) => String(product?.id || product?._id || '');
    const getCategoryId = (product) =>
      String(product?.category?._id || product?.category || product?.categoryId?._id || product?.categoryId || '');
    const getPrice = (product) => Number(product?.effectivePrice ?? product?.price ?? 0) || 0;

    const productById = new Map(products.map((product) => [getId(product), product]));
    const viewedIds = (JSON.parse(localStorage.getItem('recentlyViewedProductIds') || '[]') || []).map(String);
    const wishlistSeedProducts = (wishlistItems || [])
      .map((item) => item?.productId)
      .filter(Boolean);
    const cartSeedProducts = (cartItems || [])
      .map((item) => item?.productId)
      .filter(Boolean);

    const seedProducts = [
      ...wishlistSeedProducts,
      ...cartSeedProducts,
      ...viewedIds.map((id) => productById.get(id)).filter(Boolean),
    ];

    const seedIds = new Set(seedProducts.map((product) => getId(product)).filter(Boolean));
    const categoryAffinity = new Map();
    let priceTotal = 0;
    let priceCount = 0;

    seedProducts.forEach((product) => {
      const categoryId = getCategoryId(product);
      if (categoryId) {
        categoryAffinity.set(categoryId, (categoryAffinity.get(categoryId) || 0) + 1);
      }

      const price = getPrice(product);
      if (price > 0) {
        priceTotal += price;
        priceCount += 1;
      }
    });

    const avgSeedPrice = priceCount > 0 ? priceTotal / priceCount : 0;

    const scored = products
      .filter((product) => !seedIds.has(getId(product)))
      .map((product) => {
        let score = 0;

        const categoryId = getCategoryId(product);
        if (categoryId && categoryAffinity.has(categoryId)) {
          score += Math.min(categoryAffinity.get(categoryId) * 18, 54);
        }

        const price = getPrice(product);
        if (avgSeedPrice > 0 && price > 0) {
          const deltaRatio = Math.abs(price - avgSeedPrice) / avgSeedPrice;
          if (deltaRatio <= 0.2) score += 14;
          else if (deltaRatio <= 0.4) score += 8;
          else if (deltaRatio <= 0.6) score += 4;
        }

        score += Math.min(Number(product?.reviewSummary?.avgRating || 0) * 2, 10);
        score += Math.min(Number(product?.reviewSummary?.totalReviews || 0) / 8, 10);

        return { product, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.product);

    if (scored.length > 0) {
      return scored.slice(0, 8);
    }

    return [...products]
      .sort((a, b) => Number(b?.reviewSummary?.totalReviews || 0) - Number(a?.reviewSummary?.totalReviews || 0))
      .slice(0, 8);
  }, [products, wishlistItems, cartItems]);

  if (loading) return <FullPageLoader />;

  return (
    <MainLayout>
      {sections.hero ? (
        <section
          className="text-white py-20"
          style={{ background: `linear-gradient(90deg, ${cms.hero.startColor || '#2563eb'} 0%, ${cms.hero.endColor || '#1e3a8a'} 100%)` }}
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                {cms.hero.badgeText ? <Badge variant="success" className="mb-4">{cms.hero.badgeText}</Badge> : null}
                <h1 className="text-5xl font-bold mb-6">{cms.hero.title}</h1>
                <p className="text-xl mb-8 text-primary-100">{cms.hero.subtitle}</p>
                <div className="flex space-x-4">
                  <Link to={cms.hero.primaryButtonLink || '/products'}>
                    <Button variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100">
                      {cms.hero.primaryButtonText || 'Shop Now'}
                    </Button>
                  </Link>
                  <Link to={cms.hero.secondaryButtonLink || '/products'}>
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                      {cms.hero.secondaryButtonText || 'Explore'}
                    </Button>
                  </Link>
                </div>
              </div>
              <div>
                <img
                  src={cms.hero.imageUrl || fallbackCms.hero.imageUrl}
                  alt="Hero"
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {(cms.promos || []).length > 0 ? (
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cms.promos.map((promo, index) => (
                <Link key={`${promo.title}-${index}`} to={promo.link || '/products'} className="border rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-2">{promo.emoji || '🔥'}</div>
                  <h3 className="text-lg font-bold">{promo.title || 'Promo'}</h3>
                  <p className="text-gray-600 text-sm">{promo.subtitle || ''}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {sections.flashSales && flashSaleProducts.length > 0 ? (
        <section className="py-16 bg-red-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Flash Sales</h2>
                <p className="text-gray-600">Limited time offers - Don&apos;t miss out!</p>
              </div>
            </div>
            <ProductList
              products={flashSaleProducts}
              variant="horizontal"
              cardProps={{ showFlashCountdown: true }}
            />
          </div>
        </section>
      ) : null}

      {sections.categories ? (
        <CategoryGrid title="Explore Categories" limit={8} />
      ) : null}

      {sections.featuredProducts ? (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <Link to="/products">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            <ProductList products={featuredProducts} />
          </div>
        </section>
      ) : null}

      {sections.recommendedProducts ? (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Recommended for You</h2>
              <Link to="/products">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            <ProductList products={recommendedProducts} />
          </div>
        </section>
      ) : null}

      {sections.recentlyViewed && recentlyViewedProducts.length > 0 ? (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Recently Viewed</h2>
            <ProductList products={recentlyViewedProducts} />
          </div>
        </section>
      ) : null}

      {sections.newsletter ? (
        <section className="py-16 bg-primary-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">{cms.newsletter.title}</h2>
            <p className="text-primary-100 mb-8">{cms.newsletter.subtitle}</p>
            <div className="max-w-md mx-auto flex">
              <input
                type="email"
                placeholder={cms.newsletter.placeholder}
                className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100 rounded-l-none rounded-r-lg">
                {cms.newsletter.buttonText}
              </Button>
            </div>
          </div>
        </section>
      ) : null}
    </MainLayout>
  );
};

export default Home;

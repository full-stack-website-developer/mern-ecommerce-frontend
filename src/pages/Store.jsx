import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import FullPageLoader from '../components/common/FullPageLoader';
import ProductCard from '../components/product/ProductCard';
import ContactSellerButton from '../components/chat/ContactSellerButton';
import sellerService from '../services/seller.service';
import { formatDate } from '../utils/date';

const Store = () => {
    const { sellerSlug } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [store, setStore] = useState({ seller: null, products: [], categories: [] });
    const [activeCategory, setActiveCategory] = useState('');

    const loadStore = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await sellerService.getPublicStoreBySlug(sellerSlug);
            if (!res?.success) throw new Error('Store not found');
            setStore({
                seller: res.data?.seller || null,
                products: res.data?.products || [],
                categories: res.data?.categories || [],
            });
        } catch (err) {
            setError(err?.message || 'Unable to load store');
            setStore({ seller: null, products: [], categories: [] });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStore();
    }, [sellerSlug]);

    const filteredProducts = useMemo(() => {
        if (!activeCategory) return store.products;
        return store.products.filter((product) => product?.categoryId?.name === activeCategory);
    }, [store.products, activeCategory]);

    if (loading) return <FullPageLoader />;

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8 space-y-6">
                {error ? (
                    <Card className="border border-red-200 bg-red-50">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-red-700">{error}</p>
                            <Button variant="secondary" onClick={loadStore}>Retry</Button>
                        </div>
                    </Card>
                ) : (
                    <>
                        <Card>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={store.seller?.logo || 'https://ito-group.com/wp-content/uploads/2025/04/no-image.jpg'}
                                        alt={store.seller?.storeName || 'Store'}
                                        className="h-16 w-16 rounded-full object-cover border border-gray-200"
                                    />
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">{store.seller?.storeName || 'Store'}</h1>
                                        <p className="text-sm text-gray-600">
                                            {store.seller?.storeDescription || 'Official marketplace seller store'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Member since {formatDate(store.seller?.memberSince)}
                                        </p>
                                    </div>
                                </div>
                                <ContactSellerButton
                                    sellerId={store.seller?.sellerId}
                                    sellerName={store.seller?.storeName}
                                />
                            </div>
                        </Card>

                        <Card>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    variant={activeCategory ? 'outline' : 'primary'}
                                    onClick={() => setActiveCategory('')}
                                >
                                    All Categories
                                </Button>
                                {store.categories.map((category) => (
                                    <Button
                                        key={category}
                                        variant={activeCategory === category ? 'primary' : 'outline'}
                                        onClick={() => setActiveCategory(category)}
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>
                        </Card>

                        {filteredProducts.length === 0 ? (
                            <Card>
                                <p className="text-sm text-gray-600 text-center py-8">
                                    No active products found for this store.
                                </p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id || product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
};

export default Store;

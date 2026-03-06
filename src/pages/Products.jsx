import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import ProductCard from '../components/product/ProductCard';
import ProductFilters from '../components/product/ProductFilters';
import CategoryBreadcrumb from '../components/category/CategoryBreadcrumb';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Pagination from '../components/common/Pagination';
import FullPageLoader from '../components/common/FullPageLoader';
import EmptyState from '../components/common/EmptyState';
import productService from '../services/product.service';
import toast from 'react-hot-toast';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });

    // Initialize filters from URL params
    const [filters, setFilters] = useState(() => {
        const params = Object.fromEntries(searchParams.entries());
        return {
            page: parseInt(params.page) || 1,
            limit: parseInt(params.limit) || 24,
            category: params.category || '',
            brand: params.brand || '',
            minPrice: params.minPrice ? Number(params.minPrice) : undefined,
            maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
            search: params.search || '',
            sort: params.sort || 'newest',
            inStock: params.inStock === 'true',
            onSale: params.onSale === 'true',
            tags: params.tags || ''
        };
    });

    // Load products when filters change
    useEffect(() => {
        loadProducts();
    }, [filters]);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '' && value !== false) {
                params.set(key, value.toString());
            }
        });
        
        setSearchParams(params, { replace: true });
    }, [filters, setSearchParams]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await productService.getAll(filters);
            
            if (response.success) {
                setProducts(response.data.products || []);
                setPagination({
                    page: response.data.page || 1,
                    totalPages: response.data.totalPages || 1,
                    total: response.data.total || 0
                });
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleClearFilters = () => {
        setFilters({
            page: 1,
            limit: 24,
            category: '',
            brand: '',
            minPrice: undefined,
            maxPrice: undefined,
            search: '',
            sort: 'newest',
            inStock: false,
            onSale: false,
            tags: ''
        });
    };

    const handleSortChange = (sortValue) => {
        setFilters(prev => ({ ...prev, sort: sortValue, page: 1 }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'name', label: 'Name: A to Z' }
    ];

    if (loading && products.length === 0) {
        return (
            <MainLayout>
                <FullPageLoader />
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <CategoryBreadcrumb categoryId={filters.category} className="mb-6" />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                        <p className="text-gray-600 mt-1">
                            {pagination.total > 0 ? (
                                `Showing ${((pagination.page - 1) * filters.limit) + 1}-${Math.min(pagination.page * filters.limit, pagination.total)} of ${pagination.total} products`
                            ) : (
                                'No products found'
                            )}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* Mobile Filter Toggle */}
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="sm:hidden"
                        >
                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                        
                        {/* View Mode Toggle */}
                        <div className="hidden sm:flex border border-gray-300 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                        
                        {/* Sort Dropdown */}
                        <Select
                            value={filters.sort}
                            onChange={(e) => handleSortChange(e.target.value)}
                            options={sortOptions}
                            className="min-w-[180px]"
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="sticky top-4">
                            <ProductFilters
                                filters={filters}
                                onFiltersChange={handleFiltersChange}
                                onClearFilters={handleClearFilters}
                            />
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <div key={index} className="animate-pulse">
                                        <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className={`grid gap-6 ${
                                    viewMode === 'grid' 
                                        ? 'grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
                                        : 'grid-cols-1'
                                }`}>
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id || product._id}
                                            product={product}
                                            viewMode={viewMode}
                                        />
                                    ))}
                                </div>
                                
                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="mt-12 flex justify-center">
                                        <Pagination
                                            currentPage={pagination.page}
                                            totalPages={pagination.totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <EmptyState
                                title="No products found"
                                description="Try adjusting your filters or search terms to find what you're looking for."
                                action={
                                    <Button onClick={handleClearFilters}>
                                        Clear Filters
                                    </Button>
                                }
                            />
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Products;
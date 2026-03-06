import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Grid, List, ChevronRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import CategoryBreadcrumb from '../components/category/CategoryBreadcrumb';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import FullPageLoader from '../components/common/FullPageLoader';
import EmptyState from '../components/common/EmptyState';
import categoryService from '../services/category.service';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        filterCategories();
    }, [categories, searchTerm]);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const hierarchy = await categoryService.getCategoryHierarchy();
            setCategories(hierarchy);
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterCategories = () => {
        if (!searchTerm.trim()) {
            setFilteredCategories(categories);
            return;
        }

        const filtered = categories.filter(category => {
            const matchesMain = category.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSubcategories = category.subcategories?.some(sub => 
                sub.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            return matchesMain || matchesSubcategories;
        }).map(category => ({
            ...category,
            subcategories: category.subcategories?.filter(sub =>
                sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.name.toLowerCase().includes(searchTerm.toLowerCase())
            ) || []
        }));

        setFilteredCategories(filtered);
    };

    const getTotalProductCount = () => {
        // This would typically come from the API
        return Math.floor(Math.random() * 1000) + 10;
    };

    if (loading) {
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
                <CategoryBreadcrumb className="mb-6" />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">All Categories</h1>
                        <p className="text-gray-600 mt-1">
                            Browse our complete collection of {categories.length} categories
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 w-64"
                            />
                        </div>
                        
                        {/* View Mode Toggle */}
                        <div className="flex border border-gray-300 rounded-lg p-1">
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
                    </div>
                </div>

                {/* Categories */}
                {filteredCategories.length > 0 ? (
                    <div className="space-y-8">
                        {filteredCategories.map((category) => (
                            <div key={category._id || category.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                {/* Main Category Header */}
                                <div className="p-6 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center space-x-4">
                                        {category.logo?.url && (
                                            <img
                                                src={category.logo.url}
                                                alt={category.name}
                                                className="w-16 h-16 rounded-lg object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/64x64?text=' + category.name.charAt(0);
                                                }}
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                {category.name}
                                            </h2>
                                            <p className="text-gray-600 mt-1">
                                                {getTotalProductCount(category)} products • {category.subcategories?.length || 0} subcategories
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Select a subcategory to browse products.
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Subcategories */}
                                {category.subcategories?.length > 0 && (
                                    <div className="p-6">
                                        {viewMode === 'grid' ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                                {category.subcategories.map((subcategory) => (
                                                    <Link
                                                        key={subcategory._id || subcategory.id}
                                                        to={`/products?category=${subcategory._id || subcategory.id}`}
                                                        className="group text-center"
                                                    >
                                                        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                                            {subcategory.logo?.url && (
                                                                <img
                                                                    src={subcategory.logo.url}
                                                                    alt={subcategory.name}
                                                                    className="w-12 h-12 rounded-lg object-cover mx-auto mb-2"
                                                                    onError={(e) => {
                                                                        e.target.src = 'https://via.placeholder.com/48x48?text=' + subcategory.name.charAt(0);
                                                                    }}
                                                                />
                                                            )}
                                                            <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                {subcategory.name}
                                                            </h3>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {getTotalProductCount(subcategory)} items
                                                            </p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {category.subcategories.map((subcategory) => (
                                                    <Link
                                                        key={subcategory._id || subcategory.id}
                                                        to={`/products?category=${subcategory._id || subcategory.id}`}
                                                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                                    >
                                                        {subcategory.logo?.url && (
                                                            <img
                                                                src={subcategory.logo.url}
                                                                alt={subcategory.name}
                                                                className="w-10 h-10 rounded-lg object-cover"
                                                                onError={(e) => {
                                                                    e.target.src = 'https://via.placeholder.com/40x40?text=' + subcategory.name.charAt(0);
                                                                }}
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                {subcategory.name}
                                                            </h3>
                                                            <p className="text-xs text-gray-500">
                                                                {getTotalProductCount(subcategory)} products
                                                            </p>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No categories found"
                        description={searchTerm ? `No categories match "${searchTerm}"` : "No categories available"}
                        action={searchTerm && (
                            <Button onClick={() => setSearchTerm('')}>
                                Clear Search
                            </Button>
                        )}
                    />
                )}
            </div>
        </MainLayout>
    );
};

export default Categories;

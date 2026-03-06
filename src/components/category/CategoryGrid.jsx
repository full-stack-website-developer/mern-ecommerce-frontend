import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import categoryService from '../../services/category.service';

const CategoryGrid = ({ title = "Browse Categories", showAll = true, limit = 8 }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const hierarchy = await categoryService.getCategoryHierarchy();
            
            // Show only selectable categories (children).
            const allCategories = hierarchy.flatMap((category) => category.subcategories || []);
            
            const displayCategories = limit ? allCategories.slice(0, limit) : allCategories;
            setCategories(displayCategories);
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (categories.length === 0) {
        return null;
    }

    const topCategories = categories.slice(0, Math.min(6, categories.length));

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm font-semibold text-primary-600 tracking-wide uppercase">
                            Shop by category
                        </p>
                        <h2 className="mt-1 text-3xl font-bold text-gray-900">{title}</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Quickly jump into the collections your client will showcase most.
                        </p>
                    </div>
                    {showAll && (
                        <Link 
                            to="/categories" 
                            className="hidden sm:inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View all categories
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                    )}
                </div>

                {/* Featured tiles */}
                <div className="grid gap-4 md:grid-cols-3">
                    {topCategories.slice(0, 3).map((category, index) => (
                        <Link
                            key={category._id || category.id}
                            to={`/products?category=${category._id || category.id}`}
                            className={`relative overflow-hidden rounded-2xl group shadow-sm bg-gray-900 text-white ${
                                index === 0 ? 'md:col-span-2 h-52' : 'h-52'
                            }`}
                        >
                            <img
                                src={category.logo?.url || 'https://via.placeholder.com/600x400?text=' + category.name.charAt(0)}
                                alt={category.name}
                                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/600x400?text=' + category.name.charAt(0);
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="relative h-full flex flex-col justify-between p-5">
                                <div>
                                    <h3 className="text-xl font-semibold">{category.name}</h3>
                                    <p className="mt-1 text-sm text-gray-200 line-clamp-2">
                                        Discover hand-picked products from the {category.name} collection.
                                    </p>
                                </div>
                                <div className="flex items-center text-sm font-medium text-primary-50 group-hover:text-white">
                                    Shop now
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Secondary grid */}
                {topCategories.length > 3 && (
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {topCategories.slice(3).map((category) => (
                            <Link
                                key={category._id || category.id}
                                to={`/products?category=${category._id || category.id}`}
                                className="group"
                            >
                                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="aspect-video overflow-hidden bg-gray-100">
                                        <img
                                            src={category.logo?.url || 'https://via.placeholder.com/300x200?text=' + category.name.charAt(0)}
                                            alt={category.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/300x200?text=' + category.name.charAt(0);
                                            }}
                                        />
                                    </div>
                                    <div className="px-4 py-3">
                                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {category.name}
                                        </h3>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {showAll && (
                    <div className="mt-6 sm:hidden">
                        <Link 
                            to="/categories" 
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View all categories
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CategoryGrid;

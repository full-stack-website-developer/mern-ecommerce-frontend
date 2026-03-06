import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Grid } from 'lucide-react';
import categoryService from '../../services/category.service';

const CategoryNavigation = ({ onCategorySelect, selectedCategory, className = '' }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const navigate = useNavigate();

    useEffect(() => {
        loadCategories();
    }, []);

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

    const toggleCategory = (categoryId) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const handleSubcategoryClick = (subcategory) => {
        if (onCategorySelect) {
            onCategorySelect(subcategory);
        } else {
            navigate(`/products?category=${subcategory._id || subcategory.id}`);
        }
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
                <div className="animate-pulse space-y-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded flex-1"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Grid className="w-5 h-5" />
                    Categories
                </h3>
            </div>
            
            <div className="p-2">
                {categories.map((category) => (
                    <div key={category._id || category.id} className="mb-1">
                        {/* Main Category */}
                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                            <div 
                                className="flex items-center space-x-3 flex-1"
                            >
                                {category.logo?.url && (
                                    <img
                                        src={category.logo.url}
                                        alt={category.name}
                                        className="w-8 h-8 rounded object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/32x32?text=' + category.name.charAt(0);
                                        }}
                                    />
                                )}
                                <span className="text-sm font-medium text-gray-900">
                                    {category.name}
                                </span>
                                {category.subcategories?.length > 0 && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        {category.subcategories.length}
                                    </span>
                                )}
                            </div>
                            
                            {category.subcategories?.length > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCategory(category._id || category.id);
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded"
                                >
                                    {expandedCategories.has(category._id || category.id) ? (
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-500" />
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Subcategories */}
                        {category.subcategories?.length > 0 && expandedCategories.has(category._id || category.id) && (
                            <div className="ml-6 mt-1 space-y-1">
                                {category.subcategories.map((subcategory) => (
                                    <div
                                        key={subcategory._id || subcategory.id}
                                        className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                            selectedCategory === (subcategory._id || subcategory.id)
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'hover:bg-blue-50/70'
                                        }`}
                                        onClick={() => handleSubcategoryClick(subcategory)}
                                    >
                                        {subcategory.logo?.url && (
                                            <img
                                                src={subcategory.logo.url}
                                                alt={subcategory.name}
                                                className="w-6 h-6 rounded object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/24x24?text=' + subcategory.name.charAt(0);
                                                }}
                                            />
                                        )}
                                        <span className="text-sm text-gray-700">
                                            {subcategory.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryNavigation;

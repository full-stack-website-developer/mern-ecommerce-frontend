import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X, Filter, Search } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import CategoryNavigation from '../category/CategoryNavigation';
import productService from '../../services/product.service';
import { formatPrice } from '../../utils/price';

const ProductFilters = ({ filters, onFiltersChange, onClearFilters }) => {
    const [filterOptions, setFilterOptions] = useState({
        categories: [],
        brands: [],
        priceRange: { minPrice: 0, maxPrice: 1000 },
        tags: []
    });
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        category: true,
        brand: true,
        price: true,
        features: false,
        tags: false
    });
    const [localPriceRange, setLocalPriceRange] = useState({ min: '', max: '' });

    // Load filter options on component mount
    useEffect(() => {
        loadFilterOptions();
    }, []);

    // Initialize local price range when filter options load
    useEffect(() => {
        if (filterOptions.priceRange) {
            setLocalPriceRange({
                min: filters.minPrice || '',
                max: filters.maxPrice || ''
            });
        }
    }, [filterOptions.priceRange, filters.minPrice, filters.maxPrice]);

    const loadFilterOptions = async () => {
        try {
            setLoading(true);
            const response = await productService.getFilterOptions();
            if (response.success) {
                setFilterOptions(response.data);
            }
        } catch (error) {
            console.error('Failed to load filter options:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleFilterChange = (key, value) => {
        onFiltersChange({ ...filters, [key]: value, page: 1 });
    };

    const handleCategorySelect = (category) => {
        handleFilterChange('category', category._id || category.id);
    };

    const handleMultiSelectChange = (key, value, checked) => {
        const currentValues = filters[key] ? filters[key].split(',') : [];
        let newValues;
        
        if (checked) {
            newValues = [...currentValues, value];
        } else {
            newValues = currentValues.filter(v => v !== value);
        }
        
        handleFilterChange(key, newValues.length > 0 ? newValues.join(',') : '');
    };

    const handlePriceRangeChange = () => {
        const minPrice = localPriceRange.min ? Number(localPriceRange.min) : undefined;
        const maxPrice = localPriceRange.max ? Number(localPriceRange.max) : undefined;
        
        onFiltersChange({
            ...filters,
            minPrice,
            maxPrice,
            page: 1
        });
    };

    const clearPriceRange = () => {
        setLocalPriceRange({ min: '', max: '' });
        onFiltersChange({
            ...filters,
            minPrice: undefined,
            maxPrice: undefined,
            page: 1
        });
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.category) count++;
        if (filters.brand) count++;
        if (filters.minPrice || filters.maxPrice) count++;
        if (filters.inStock) count++;
        if (filters.onSale) count++;
        if (filters.tags) count++;
        return count;
    };

    const FilterSection = ({ title, sectionKey, children }) => {
        const isExpanded = expandedSections[sectionKey];
        
        return (
            <div className="border-b border-gray-200 pb-4 mb-4">
                <button
                    onClick={() => toggleSection(sectionKey)}
                    className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-gray-700 transition-colors"
                >
                    <span>{title}</span>
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </button>
                {isExpanded && (
                    <div className="mt-3">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                        {getActiveFiltersCount() > 0 && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                {getActiveFiltersCount()}
                            </span>
                        )}
                    </div>
                    {getActiveFiltersCount() > 0 && (
                        <button
                            onClick={onClearFilters}
                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        >
                            <X className="w-4 h-4" />
                            Clear all
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Brands */}
                {filterOptions.brands.length > 0 && (
                    <FilterSection title="Brands" sectionKey="brand">
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {filterOptions.brands.map((brand) => (
                                <label key={brand._id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <input
                                        type="radio"
                                        name="brand"
                                        checked={filters.brand === brand._id}
                                        onChange={(e) => handleFilterChange('brand', e.target.checked ? brand._id : '')}
                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 flex-1">{brand.name}</span>
                                    <span className="text-xs text-gray-500">({brand.count})</span>
                                </label>
                            ))}
                        </div>
                    </FilterSection>
                )}

                {/* Price Range */}
                <FilterSection title="Price Range" sectionKey="price">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={localPriceRange.min}
                                onChange={(e) => setLocalPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                className="text-sm"
                            />
                            <span className="text-gray-500">to</span>
                            <Input
                                type="number"
                                placeholder="Max"
                                value={localPriceRange.max}
                                onChange={(e) => setLocalPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                className="text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePriceRangeChange}
                                className="flex-1"
                            >
                                Apply
                            </Button>
                            {(filters.minPrice || filters.maxPrice) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearPriceRange}
                                    className="px-3"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        <div className="text-xs text-gray-500">
                            Range: {formatPrice(filterOptions.priceRange.minPrice)} - {formatPrice(filterOptions.priceRange.maxPrice)}
                        </div>
                    </div>
                </FilterSection>

                {/* Features */}
                <FilterSection title="Features" sectionKey="features">
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.inStock || false}
                                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">In Stock Only</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.onSale || false}
                                onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">On Sale</span>
                        </label>
                    </div>
                </FilterSection>

                {/* Tags */}
                {filterOptions.tags.length > 0 && (
                    <FilterSection title="Tags" sectionKey="tags">
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {filterOptions.tags.slice(0, 20).map((tag) => {
                                const selectedTags = filters.tags ? filters.tags.split(',') : [];
                                const isSelected = selectedTags.includes(tag.name);
                                
                                return (
                                    <label key={tag.name} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => handleMultiSelectChange('tags', tag.name, e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700 flex-1">{tag.name}</span>
                                        <span className="text-xs text-gray-500">({tag.count})</span>
                                    </label>
                                );
                            })}
                        </div>
                    </FilterSection>
                )}
            </div>

            {/* Category Navigation */}
            <CategoryNavigation 
                onCategorySelect={handleCategorySelect}
                selectedCategory={filters.category}
            />
        </div>
    );
};

export default ProductFilters;
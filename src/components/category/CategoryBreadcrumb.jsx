import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import categoryService from '../../services/category.service';

const CategoryBreadcrumb = ({ categoryId, className = '' }) => {
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (categoryId) {
            loadBreadcrumbs();
        } else {
            setBreadcrumbs([]);
            setLoading(false);
        }
    }, [categoryId]);

    const loadBreadcrumbs = async () => {
        try {
            setLoading(true);
            const hierarchy = await categoryService.getCategoryHierarchy();
            const breadcrumbPath = buildBreadcrumbPath(hierarchy, categoryId);
            setBreadcrumbs(breadcrumbPath);
        } catch (error) {
            console.error('Failed to load breadcrumbs:', error);
            setBreadcrumbs([]);
        } finally {
            setLoading(false);
        }
    };

    const buildBreadcrumbPath = (categories, targetId) => {
        const path = [];
        
        // Find the target category and build path
        for (const category of categories) {
            if (category._id === targetId || category.id === targetId) {
                path.push(category);
                return path;
            }
            
            // Check subcategories
            if (category.subcategories?.length > 0) {
                for (const subcategory of category.subcategories) {
                    if (subcategory._id === targetId || subcategory.id === targetId) {
                        path.push(category);
                        path.push(subcategory);
                        return path;
                    }
                }
            }
        }
        
        return path;
    };

    if (loading) {
        return (
            <div className={`flex items-center space-x-2 text-sm text-gray-500 ${className}`}>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                <ChevronRight className="w-4 h-4" />
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
        );
    }

    if (breadcrumbs.length === 0) {
        return null;
    }

    return (
        <nav className={`flex items-center space-x-2 text-sm text-gray-500 ${className}`} aria-label="Breadcrumb">
            <Link 
                to="/" 
                className="flex items-center hover:text-gray-700 transition-colors"
            >
                <Home className="w-4 h-4" />
                <span className="ml-1">Home</span>
            </Link>
            
            <ChevronRight className="w-4 h-4" />
            
            <Link 
                to="/products" 
                className="hover:text-gray-700 transition-colors"
            >
                Products
            </Link>
            
            {breadcrumbs.map((item, index) => (
                <div key={item._id || item.id} className="flex items-center space-x-2">
                    <ChevronRight className="w-4 h-4" />
                    {index === breadcrumbs.length - 1 ? (
                        <span className="font-medium text-gray-900" aria-current="page">
                            {item.name}
                        </span>
                    ) : (
                        <Link 
                            to={`/products?category=${item._id || item.id}`}
                            className="hover:text-gray-700 transition-colors"
                        >
                            {item.name}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
};

export default CategoryBreadcrumb;
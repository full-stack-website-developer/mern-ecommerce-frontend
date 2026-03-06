import { useState, useEffect } from 'react';
import categoryService from '../services/category.service';

const useCategories = (options = {}) => {
    const [categories, setCategories] = useState([]);
    const [hierarchy, setHierarchy] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { 
        loadHierarchy = true, 
        parentId = null,
        autoLoad = true 
    } = options;

    useEffect(() => {
        if (autoLoad) {
            loadCategories();
        }
    }, [autoLoad, parentId]);

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError(null);

            if (loadHierarchy) {
                const hierarchyData = await categoryService.getCategoryHierarchy();
                setHierarchy(hierarchyData);
                
                // Flatten for categories array
                const flatCategories = [];
                hierarchyData.forEach(category => {
                    flatCategories.push(category);
                    if (category.subcategories?.length > 0) {
                        flatCategories.push(...category.subcategories);
                    }
                });
                setCategories(flatCategories);
            } else {
                const response = await categoryService.getAll({ parentId });
                if (response.success) {
                    setCategories(response.data || []);
                }
            }
        } catch (err) {
            setError(err);
            console.error('Failed to load categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryById = (id) => {
        return categories.find(cat => (cat._id || cat.id) === id);
    };

    const getMainCategories = () => {
        return hierarchy;
    };

    const getSubcategories = (parentId) => {
        const parent = hierarchy.find(cat => (cat._id || cat.id) === parentId);
        return parent?.subcategories || [];
    };

    const refresh = () => {
        loadCategories();
    };

    return {
        categories,
        hierarchy,
        loading,
        error,
        getCategoryById,
        getMainCategories,
        getSubcategories,
        refresh
    };
};

export default useCategories;
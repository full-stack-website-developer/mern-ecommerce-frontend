import { useState, useEffect } from 'react';
import categoryService from '../../../services/category.service';

export const useCategories = (type = 'child') => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await categoryService.categories(type);
        if (res.success) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [type]);

  return { categories, loading, error };
};
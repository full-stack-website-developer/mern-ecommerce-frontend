import { useState, useEffect } from 'react';
import brandService from '../../../services/brand.service';

export const useBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await brandService.getBrands();
        if (res.success) {
          setBrands(res.data);
        }
      } catch (err) {
        console.error('Error fetching brands:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return { brands, loading, error, setBrands };
};
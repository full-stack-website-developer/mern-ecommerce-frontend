import { useState, useEffect } from 'react';
import productService from '../../../services/product.service';

export const useProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await productService.getById(productId);
        if (res.success) {
          setProduct(res.data);
        }
      } catch (err) {
        console.error(`Error fetching product ${productId}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
};
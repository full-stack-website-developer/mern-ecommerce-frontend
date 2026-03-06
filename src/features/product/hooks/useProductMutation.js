import { useState } from 'react';
import productService from '../../../services/product.service';
import { ApiError } from '../../../api/api.client';

export const useProductMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProduct = async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await productService.create(formData);
      return { success: true, data: res.data };
    } catch (err) {
      const errorData = handleError(err);
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (formData, productId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await productService.update(formData, productId);
      return { success: true, data: res.data };
    } catch (err) {
      const errorData = handleError(err);
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      setIsLoading(false);
    }
  };

  const updateSellerProduct = async (formData, productId) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await productService.editSellerProduct(productId, formData);
      return { success: true, data: res.data };
    } catch (err) {
      const errorData = handleError(err);
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    setIsLoading(true);
    
    try {
      const res = await productService.delete(id);
      return { success: true, data: res.data };
    } catch(error) {
       return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }

  return {
    createProduct,
    updateProduct,
    updateSellerProduct,
    deleteProduct,
    isLoading,
    error,
  };
};

function handleError(error) {
  if (error instanceof ApiError) {
    if (error.status === 400 && error.data?.errors) {
      return {
        type: 'validation',
        errors: error.data.errors,
      };
    }
    return {
      type: 'server',
      message: error.message,
    };
  }
  return {
    type: 'unknown',
    message: 'An unexpected error occurred',
  };
}

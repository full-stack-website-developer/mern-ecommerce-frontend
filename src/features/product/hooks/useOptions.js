import { useState, useEffect } from 'react';
import optionService from '../../../services/option.service';

export const useOptions = () => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await optionService.getAll();
        if (res.success) {
          setOptions(res.data.options);
        }
      } catch (err) {
        console.error('Error fetching options:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { options, loading, error };
};
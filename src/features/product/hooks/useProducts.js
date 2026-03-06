import { useEffect, useState } from "react";
import productService from "../../../services/product.service";

const useProducts = () => {
    const [ products, setProducts ] = useState([]);
    const [ loading, setLoading ] = useState(false);
    
    useEffect(() => {
        setLoading(true);
        const getProducts = async() => {
            try {
                const res = await productService.products();
                if (res.success) {
                    setProducts(res.data.products);
                }
            } catch(error) {
                console.error(`Error While Fetching Products: ${error}`);
            } finally {
                setLoading(false)
            }
        }
        getProducts();
    }, []);

    return {
        setProducts,
        products,
        loading
    }
}

export default useProducts;

import { useContext } from "react";
import { CartContext } from "../store/cartContext";

const useCartContext = () => {
    const cart = useContext(CartContext);
    return cart;
};

export default useCartContext;
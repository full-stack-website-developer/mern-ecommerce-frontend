import { useContext } from 'react';
import { WishlistContext } from '../store/wishlistContext';

const useWishlistContext = () => useContext(WishlistContext);

export default useWishlistContext;

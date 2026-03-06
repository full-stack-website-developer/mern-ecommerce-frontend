import { createContext, useEffect, useMemo, useState } from 'react';
import dashboardService from '../services/dashboard.service';
import useUserContext from '../hooks/useUserContext';

export const WishlistContext = createContext({
  wishlistItems: [],
  savedForLaterItems: [],
  wishlistLoading: false,
  saveForLaterLoading: false,
  wishlistCount: 0,
  savedForLaterCount: 0,
  isInWishlist: () => false,
  isSavedForLater: () => false,
  refreshWishlist: async () => false,
  refreshSavedForLater: async () => false,
  toggleWishlist: async () => false,
  moveToSaveForLater: async () => false,
  moveToWishlist: async () => false,
  removeFromWishlist: async () => false,
  removeFromSavedForLater: async () => false,
  clearWishlist: async () => false,
  clearSavedForLater: async () => false,
});

const WishlistProvider = ({ children }) => {
  const { user, loading: userLoading } = useUserContext();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [savedForLaterItems, setSavedForLaterItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [saveForLaterLoading, setSaveForLaterLoading] = useState(false);

  const wishlistIds = useMemo(
    () => new Set(wishlistItems.map((item) => String(item?.productId?._id))),
    [wishlistItems]
  );

  const savedForLaterIds = useMemo(
    () => new Set(savedForLaterItems.map((item) => String(item?.productId?._id))),
    [savedForLaterItems]
  );

  const refreshWishlist = async () => {
    if (!user?.id) {
      setWishlistItems([]);
      return false;
    }

    try {
      setWishlistLoading(true);
      const res = await dashboardService.getWishlist();
      if (!res?.success) return false;
      setWishlistItems(res?.data?.items || []);
      return true;
    } catch {
      return false;
    } finally {
      setWishlistLoading(false);
    }
  };

  const refreshSavedForLater = async () => {
    if (!user?.id) {
      setSavedForLaterItems([]);
      return false;
    }

    try {
      setSaveForLaterLoading(true);
      const res = await dashboardService.getSavedForLater();
      if (!res?.success) return false;
      setSavedForLaterItems(res?.data?.items || []);
      return true;
    } catch {
      return false;
    } finally {
      setSaveForLaterLoading(false);
    }
  };

  const refreshAll = async () => {
    if (!user?.id) {
      setWishlistItems([]);
      setSavedForLaterItems([]);
      return;
    }

    await Promise.all([refreshWishlist(), refreshSavedForLater()]);
  };

  useEffect(() => {
    if (userLoading) return;
    refreshAll();
  }, [userLoading, user?.id]);

  const toggleWishlist = async (productId) => {
    if (!user?.id || !productId) return false;

    try {
      if (wishlistIds.has(String(productId))) {
        const res = await dashboardService.removeWishlistItem(productId);
        if (!res?.success) return false;
      } else {
        const res = await dashboardService.addWishlistItem({ productId, saveForLater: false });
        if (!res?.success) return false;
      }

      await Promise.all([refreshWishlist(), refreshSavedForLater()]);
      return true;
    } catch {
      return false;
    }
  };

  const moveToSaveForLater = async (productId) => {
    if (!user?.id || !productId) return false;

    try {
      const res = await dashboardService.addSavedForLaterItem({ productId });
      if (!res?.success) return false;
      await Promise.all([refreshWishlist(), refreshSavedForLater()]);
      return true;
    } catch {
      return false;
    }
  };

  const moveToWishlist = async (productId) => {
    if (!user?.id || !productId) return false;

    try {
      const res = await dashboardService.addWishlistItem({ productId, saveForLater: false });
      if (!res?.success) return false;
      await Promise.all([refreshWishlist(), refreshSavedForLater()]);
      return true;
    } catch {
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user?.id || !productId) return false;

    try {
      const res = await dashboardService.removeWishlistItem(productId);
      if (!res?.success) return false;
      setWishlistItems((prev) => prev.filter((item) => String(item?.productId?._id) !== String(productId)));
      return true;
    } catch {
      return false;
    }
  };

  const removeFromSavedForLater = async (productId) => {
    if (!user?.id || !productId) return false;

    try {
      const res = await dashboardService.removeSavedForLaterItem(productId);
      if (!res?.success) return false;
      setSavedForLaterItems((prev) => prev.filter((item) => String(item?.productId?._id) !== String(productId)));
      return true;
    } catch {
      return false;
    }
  };

  const clearWishlist = async () => {
    if (!user?.id) return false;

    try {
      const res = await dashboardService.clearWishlist();
      if (!res?.success) return false;
      setWishlistItems([]);
      return true;
    } catch {
      return false;
    }
  };

  const clearSavedForLater = async () => {
    if (!user?.id) return false;

    try {
      const res = await dashboardService.clearSavedForLater();
      if (!res?.success) return false;
      setSavedForLaterItems([]);
      return true;
    } catch {
      return false;
    }
  };

  const values = {
    wishlistItems,
    savedForLaterItems,
    wishlistLoading,
    saveForLaterLoading,
    wishlistCount: wishlistItems.length,
    savedForLaterCount: savedForLaterItems.length,
    isInWishlist: (productId) => wishlistIds.has(String(productId)),
    isSavedForLater: (productId) => savedForLaterIds.has(String(productId)),
    refreshWishlist,
    refreshSavedForLater,
    toggleWishlist,
    moveToSaveForLater,
    moveToWishlist,
    removeFromWishlist,
    removeFromSavedForLater,
    clearWishlist,
    clearSavedForLater,
  };

  return <WishlistContext.Provider value={values}>{children}</WishlistContext.Provider>;
};

export default WishlistProvider;

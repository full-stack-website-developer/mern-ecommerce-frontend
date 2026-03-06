import { createContext, useEffect, useState } from "react";
import cartService from "../services/cart.service";
import useUserContext from "../hooks/useUserContext";
import FullPageLoader from "../components/common/FullPageLoader";

export const CartContext = createContext({
  cartItems: [],
  cartLoading: true,
  addToCart: () => {},
  deleteItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
});

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const { loading: userLoading, user } = useUserContext();

  useEffect(() => {
    if (userLoading) return;

    const abortController = new AbortController();

    async function fetchAndSyncCart() {
      try {
        setCartLoading(true);

        // 🧠 Guest user
        if (!user?.id) {
          const localCart = JSON.parse(localStorage.getItem("cart")) || [];

          if (localCart.length === 0) {
            setCartItems([]);
            return;
          }

          const res = await cartService.preview(localCart, {
            signal: abortController.signal,
          });

          setCartItems(res?.data?.items || []);
          return;
        }

        const resDb = await cartService.getByUserId(user.id, {
          signal: abortController.signal,
        });
        const dbCartItems = resDb?.data?.items || [];

        const localCart = JSON.parse(localStorage.getItem("cart")) || [];
        let previewLocalCart = [];

        if (localCart.length > 0) {
          try {
            const previewRes = await cartService.preview(localCart);
            previewLocalCart = previewRes?.items || [];
          } catch (err) {
            console.error("Failed to preview guest cart", err);
            // fallback: use raw localCart
            previewLocalCart = localCart.map(item => ({
              ...item,
              productId: { _id: item.productId },
              variantId: item.variantId ? { _id: item.variantId } : null
            }));
          }
        }

        // Now merge **already previewed items**
        const mergedCart = mergeCarts(dbCartItems, previewLocalCart);
        setCartItems(mergedCart);

        // Sync local storage to backend once
        if (localCart.length > 0) {
          await cartService.bulkCreate({
            userId: user.id,
            items: localCart,
          });
          localStorage.removeItem("cart");
        }

        const finalCartRes = await cartService.getByUserId(user.id);
        setCartItems(finalCartRes?.data?.items || []);
      } catch (err) {
        console.error("Cart fetch/sync failed", err);
      } finally {
        setCartLoading(false);
      }
    }

    fetchAndSyncCart();
    return () => abortController.abort();
  }, [userLoading, user?.id]);

  function normalizeId(id) {
    if (!id) return null;
    if (typeof id === "string") return id;
    return id._id || null;
  }

  function mergeCarts(dbCart, localCart) {
    const merged = [...dbCart];

    localCart.forEach(localItem => {
      const localProductId = normalizeId(localItem.productId);
      const localVariantId = normalizeId(localItem.variantId);

      const existing = merged.find(item => {
        const dbProductId = normalizeId(item.productId);
        const dbVariantId = normalizeId(item.variantId);
        return (
          dbProductId === localProductId &&
          dbVariantId === localVariantId
        );
      });

      if (existing) {
        existing.quantity += localItem.quantity;
      } else {
        merged.push(localItem);
      }
    });

    return merged;
  }

  async function addToCart(item) {
    setCartItems(prev => {
      const productId = normalizeId(item.productId);
      const variantId = normalizeId(item.variantId);

      const exists = prev.find(cartItem => {
        return (
          normalizeId(cartItem.productId) === productId &&
          normalizeId(cartItem.variantId) === variantId
        );
      });

      if (exists) {
        return prev.map(cartItem => {
          if (
            normalizeId(cartItem.productId) === productId &&
            normalizeId(cartItem.variantId) === variantId
          ) {
            return {
              ...cartItem,
              quantity: cartItem.quantity + item.quantity,
            };
          }
          return cartItem;
        });
      }

      return [...prev, item];
    });

    // ✅ Sync to backend or localStorage
    await syncCartItem(item);

    // ✅ For guest: hydrate preview immediately
    if (!user?.id) {
      const localCart = JSON.parse(localStorage.getItem("cart")) || [];
      try {
        const res = await cartService.preview(localCart);
        setCartItems(res?.data?.items || localCart);
      } catch (err) {
        console.error("Guest cart preview failed", err);
        setCartItems(localCart);
      }
    } else {
      // ✅ For logged-in: re-fetch fully populated cart from backend
      try {
        const res = await cartService.getByUserId(user.id);
        setCartItems(res?.data?.items || []);
      } catch (err) {
        console.error("Cart re-fetch after add failed", err);
      }
    }
  }

  async function syncCartItem(item) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token || !user?.id) {
      console.log('here')
      const localCart = JSON.parse(localStorage.getItem("cart")) || [];

      const normalizeId = (id) =>
        typeof id === "string" ? id : id?._id || null;

      const productId = normalizeId(item.productId);
      const variantId = normalizeId(item.variantId);

      const index = localCart.findIndex(ci => {
        return (
          normalizeId(ci.productId) === productId &&
          normalizeId(ci.variantId) === variantId
        );
      });

      if (index !== -1) {
        localCart[index].quantity += item.quantity;
      } else {
        localCart.push(item);
      }

      localStorage.setItem("cart", JSON.stringify(localCart));
      return;
    }

    try {
      await cartService.create({
        userId: user.id,
        item,
      });
    } catch (err) {
      console.error("Cart sync failed", err);
    }
  }

  async function deleteItem(itemId, variantId = null) {
    if (!user?.id) {
      const localCart = JSON.parse(localStorage.getItem("cart")) || [];
      const updatedCart = localCart.filter(
        item =>
          !(
            normalizeId(item.productId) === normalizeId(itemId) &&
            normalizeId(item.variantId) === normalizeId(variantId)
          )
      );

      localStorage.setItem("cart", JSON.stringify(updatedCart));

      // Update preview immediately
      try {
        const res = await cartService.preview(updatedCart);
        setCartItems(res?.data?.items || updatedCart);
      } catch {
        setCartItems(updatedCart);
      }
      return;
    }

    // Logged-in user
    try {
      const res = await cartService.delete(itemId);
      if (res?.data?.items) setCartItems(res.data.items);
    } catch (err) {
      console.error("Cart item deletion failed", err);
    }
  }


  async function updateQuantity(item, delta) {
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return; // prevent going below 1

    // Optimistic UI update
    setCartItems(prev =>
      prev.map(ci => {
        const sameProduct = normalizeId(ci.productId) === normalizeId(item.productId);
        const sameVariant = normalizeId(ci.variantId) === normalizeId(item.variantId);
        if (sameProduct && sameVariant) {
          return { ...ci, quantity: newQuantity };
        }
        return ci;
      })
    );

    if (!user?.id) {
      // Guest: update localStorage then re-preview
      const localCart = JSON.parse(localStorage.getItem("cart")) || [];
      const productId = normalizeId(item.productId);
      const variantId = normalizeId(item.variantId);

      const updatedLocal = localCart.map(ci => {
        const sameProduct = normalizeId(ci.productId) === productId;
        const sameVariant = normalizeId(ci.variantId) === variantId;
        if (sameProduct && sameVariant) {
          return { ...ci, quantity: newQuantity };
        }
        return ci;
      });

      localStorage.setItem("cart", JSON.stringify(updatedLocal));

      try {
        const res = await cartService.preview(updatedLocal);
        setCartItems(res?.data?.items || updatedLocal);
      } catch (err) {
        console.error("Guest quantity update preview failed", err);
      }
      return;
    }

    // Logged-in: call PATCH /api/cart/:itemId
    try {
      const itemId = item._id;
      const res = await cartService.updateQuantity(itemId, user.id, newQuantity);
      if (res?.data?.items) setCartItems(res.data.items);
    } catch (err) {
      console.error("Quantity update failed", err);
      // Rollback on error
      setCartItems(prev =>
        prev.map(ci => {
          const sameProduct = normalizeId(ci.productId) === normalizeId(item.productId);
          const sameVariant = normalizeId(ci.variantId) === normalizeId(item.variantId);
          if (sameProduct && sameVariant) {
            return { ...ci, quantity: item.quantity }; // revert to original
          }
          return ci;
        })
      );
    }
  }

  async function clearCart(userId) {
    if (!userId) {
      // Guest: just wipe localStorage
      localStorage.removeItem('cart');
      setCartItems([]);
      return;
    }

    // Logged-in: clear on backend too
    try {
      await cartService.clear(userId); // you'll add this endpoint
      setCartItems([]);
    } catch (err) {
      console.error('Cart clear failed', err);
      // Still clear UI even if API fails
      setCartItems([]);
    }
  }

  if (cartLoading || userLoading) {
    return <FullPageLoader />;
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        addToCart,
        updateQuantity,
        deleteItem,
        normalizeId,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
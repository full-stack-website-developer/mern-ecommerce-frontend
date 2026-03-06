export const groupItemsBySeller = (cartItems) => {
  const map = new Map();

  for (const item of cartItems) {
    const sellerId = item.sellerId || item.product?.sellerId?._id || item.product?.sellerId || item.productId?.sellerId || null;

    // if (!sellerId) {
    //   throw new Error('Missing sellerId for cart item');
    // }

    if (!map.has(sellerId)) {
      map.set(sellerId, []);
    }

    map.get(sellerId).push({
      productId: item.productId?._id || item.productId,
      variantId: item.variantId?._id || item.variantId || null,
      sellerId,
      quantity:  item.quantity,
      price:     item.price,
    });
  }

  return map;
};

export const calcTotals = (items) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = 0; // or your tax logic
  const total = subtotal + tax;
  return { subtotal, tax, total };
};
export function getDisplayPrice(product) {
  if (!product) return 0;

  if (typeof product.effectivePrice === 'number' && product.effectivePrice > 0) {
    return product.effectivePrice;
  }

  const now = Date.now();
  const saleEnd = product?.flashSale?.endAt ? new Date(product.flashSale.endAt).getTime() : null;
  const saleStart = product?.flashSale?.startAt ? new Date(product.flashSale.startAt).getTime() : null;
  const flashSaleActive = Boolean(
    product?.flashSale?.isActive &&
    Number(product?.flashSale?.salePrice) > 0 &&
    saleEnd &&
    saleEnd > now &&
    (!saleStart || saleStart <= now)
  );

  if (flashSaleActive) {
    return Number(product.flashSale.salePrice) || 0;
  }

  if (typeof product.price === 'number' && product.price > 0) {
    const discount = Number(product.discount) || 0;
    if (discount > 0) {
      return Number((product.price * (1 - discount / 100)).toFixed(2));
    }
    return product.price;
  }

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const prices = product.variants
      .map((variant) => Number(variant?.price))
      .filter((price) => Number.isFinite(price) && price >= 0);

    if (prices.length > 0) return Math.min(...prices);
  }

  return Number(product.price) || 0;
}

export function formatDisplayPrice(product) {
  return getDisplayPrice(product).toFixed(2);
}

export function formatPrice(price) {
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}

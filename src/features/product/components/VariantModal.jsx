import { useEffect, useState } from 'react';
import Button from '../../../components/common/Button';

const VariantModal = ({ product, onClose, onConfirm }) => {
  const { variants } = product;

  const [selectedVariants, setSelectedVariants] = useState([]);
  const [activeVariant, setActiveVariant] = useState(null);

  // Initialize defaults: use first real variant combo when possible
  useEffect(() => {
    if (!product?.options?.length) return;

    if (Array.isArray(variants) && variants.length > 0) {
      const first = variants[0];
      const defaultsFromVariant = (first.options || []).map((opt) => ({
        optionId: String(opt.optionId),
        selectedValue: String(opt.valueId),
      }));
      if (defaultsFromVariant.length > 0) {
        setSelectedVariants(defaultsFromVariant);
        return;
      }
    }

    const defaults = product.options
      .map((opt) => {
        const optionDoc = opt?.optionId;
        const optionId = optionDoc?._id ? String(optionDoc._id) : null;
        if (!optionId) return null;

        const chosenIds = (opt.values || []).map((v) =>
          typeof v === 'string' ? v : v?._id?.toString?.() || v?.toString?.()
        );

        const firstChosenId = chosenIds[0];
        const fallbackId = optionDoc?.values?.[0]?._id?.toString?.();
        const selectedValue = firstChosenId || fallbackId;

        if (!selectedValue) return null;
        return { optionId, selectedValue };
      })
      .filter(Boolean);

    setSelectedVariants(defaults);
  }, [product?.options]);

  // Resolve active variant
  useEffect(() => {
    if (!variants?.length || !selectedVariants.length) return;

    const match = variants.find(variant =>
      selectedVariants.every(sel =>
        variant.options.some(opt =>
          String(opt.optionId) === sel.optionId &&
          String(opt.valueId) === sel.selectedValue
        )
      )
    );

    setActiveVariant(match || null);
  }, [selectedVariants, variants]);

  // ESC to close
  useEffect(() => {
    const handleEscape = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const optionCount = Array.isArray(product?.options) ? product.options.length : 0;
  const hasAllSelections =
    product?.hasVariants &&
    optionCount > 0 &&
    selectedVariants.length === optionCount &&
    selectedVariants.every((sel) =>
      product.options.some(
        (opt) => String(opt.optionId?._id ?? opt.optionId) === sel.optionId
      )
    );

  const noMatchingVariant =
    product?.hasVariants &&
    hasAllSelections &&
    !activeVariant &&
    Array.isArray(variants) &&
    variants.length > 0;

  const price = activeVariant?.price ?? (product?.hasVariants ? null : product?.price);

  // Variant selection handler
  const handleVariantsSelection = (optionId, valueId) => {
    const variant = {
      optionId: String(optionId),
      selectedValue: String(valueId),
    };

    setSelectedVariants(prev =>
      prev.some(v => v.optionId === variant.optionId)
        ? prev.map(v => (v.optionId === variant.optionId ? variant : v))
        : [...prev, variant]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-10">
        <h2 className="text-lg font-semibold mb-4">Select Options</h2>

        {/* Options */}
        <div className="space-y-4 mb-6">
          {product?.options?.map((opt) => {
            const optionDoc = opt?.optionId;
            if (!optionDoc?._id) return null;

            const optionId = String(optionDoc._id);
            const chosenSet = new Set(
              (opt.values || []).map((v) =>
                typeof v === 'string' ? v : v?._id?.toString?.() || v?.toString?.()
              )
            );

            const displayValues = Array.isArray(optionDoc.values)
              ? optionDoc.values.filter((v) =>
                  chosenSet.size === 0 || chosenSet.has(v._id?.toString?.())
                )
              : [];

            return (
              <div key={optionId}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {optionDoc.name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {displayValues.map((val) => {
                    const valueId = val._id?.toString?.();
                    if (!valueId) return null;

                    const isSelected = selectedVariants.some(
                      (v) =>
                        v.optionId === optionId &&
                        v.selectedValue === valueId
                    );

                    return (
                      <button
                        key={valueId}
                        onClick={() =>
                          handleVariantsSelection(optionId, valueId)
                        }
                        className={`px-3 py-2 rounded border-2 text-sm ${
                          isSelected
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-400'
                        }`}
                        type="button"
                      >
                        {val.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Price */}
        <div className="mb-4">
          {noMatchingVariant ? (
            <div className="text-sm text-gray-500">
              This combination is not available.
            </div>
          ) : (
            <span className="text-xl font-semibold">
              {price !== null ? `$${price}` : '—'}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={product?.hasVariants && !activeVariant}
            onClick={() => onConfirm(activeVariant)}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VariantModal;
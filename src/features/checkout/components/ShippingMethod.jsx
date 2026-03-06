// ============================================================
//  ShippingMethod
//
//  🎓 LEARNING NOTE:
//  Notice how simple this component is! It just:
//  - Reads state.shippingMethod from useCheckout
//  - Calls setShippingMethod when user picks one
//  - Calls nextStep / prevStep for navigation
//
//  All the "what does each method cost?" logic lives in
//  checkout.selectors.js, not in this component.
//  Components should be "thin" — just UI wiring.
// ============================================================

import Card from '../../../components/common/Card';
import useCheckout from '../hooks/useCheckout';
import usePlatformSettings from '../../../hooks/usePlatformSettings';
import { SHIPPING_METHODS, getShippingCost } from '../checkout.selectors';

const ShippingMethod = () => {
  const { state, setShippingMethod, nextStep, prevStep, orderSummary } = useCheckout();
  const { settings } = usePlatformSettings();
  const formatMoney = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: settings.currency || 'USD',
  }).format(value || 0);

  return (
    <Card>
      <h2 className="text-xl font-bold mb-6">📦 Shipping Method</h2>

      <div className="space-y-3">
        {Object.entries(SHIPPING_METHODS).map(([key, method]) => {
          const cost = getShippingCost(key, orderSummary.subtotal, settings);
          return (
          <label
            key={key}
            className={`
              flex items-center justify-between p-4 border rounded-lg cursor-pointer transition
              ${state.shippingMethod === key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-400'}
            `}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shippingMethod"
                value={key}
                checked={state.shippingMethod === key}
                onChange={() => setShippingMethod(key)}
                className="accent-blue-600"
              />
              <div>
                <p className="font-medium text-gray-800">{method.label}</p>
                <p className="text-sm text-gray-500">{method.days}</p>
              </div>
            </div>
            <span className="font-semibold text-gray-800">{formatMoney(cost)}</span>
          </label>
          );
        })}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={prevStep}
          className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700
                     font-semibold py-3 px-6 rounded-lg transition"
        >
          ← Back
        </button>
        <button
          onClick={nextStep}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white
                     font-semibold py-3 px-6 rounded-lg transition"
        >
          Continue to Payment →
        </button>
      </div>
    </Card>
  );
};

export default ShippingMethod;

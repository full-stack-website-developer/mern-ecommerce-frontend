// ============================================================
//  CheckoutSteps — Visual step progress bar
//
//  🎓 LEARNING NOTE:
//  This is a purely "presentational" component. It receives data
//  as props and renders UI. It has NO logic, NO state, NO hooks.
//  This is called the "dumb component" pattern.
//  Keep UI separate from logic. Easier to test & reuse.
// ============================================================

import { CHECKOUT_STEPS } from '../checkout.reducer';

const STEPS = [
  { key: CHECKOUT_STEPS.ADDRESS,  label: 'Address',  icon: '📍', number: 1 },
  { key: CHECKOUT_STEPS.SHIPPING, label: 'Shipping', icon: '📦', number: 2 },
  { key: CHECKOUT_STEPS.PAYMENT,  label: 'Payment',  icon: '💳', number: 3 },
  { key: CHECKOUT_STEPS.REVIEW,   label: 'Review',   icon: '✅', number: 4 },
];

const CheckoutSteps = ({ currentStep, onStepClick }) => {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep);

  return (
    <div className="flex items-center justify-between mb-8 px-2">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive    = index === currentIndex;
        const isClickable = index < currentIndex; // can go back to completed steps

        return (
          <div key={step.key} className="flex items-center flex-1">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => isClickable && onStepClick(step.key)}
                disabled={!isClickable}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  text-sm font-bold transition-all duration-300
                  ${isCompleted ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600' : ''}
                  ${isActive    ? 'bg-blue-600 text-white ring-4 ring-blue-200' : ''}
                  ${!isCompleted && !isActive ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}
                `}
              >
                {isCompleted ? '✓' : step.number}
              </button>
              <span className={`
                text-xs mt-1 font-medium
                ${isActive    ? 'text-blue-600' : ''}
                ${isCompleted ? 'text-green-600' : ''}
                ${!isActive && !isCompleted ? 'text-gray-400' : ''}
              `}>
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {index < STEPS.length - 1 && (
              <div className={`
                flex-1 h-1 mx-2 rounded transition-all duration-500
                ${index < currentIndex ? 'bg-green-400' : 'bg-gray-200'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CheckoutSteps;
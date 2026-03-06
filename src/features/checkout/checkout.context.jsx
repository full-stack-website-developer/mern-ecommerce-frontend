// ============================================================
//  CHECKOUT CONTEXT
//
//  🎓 LEARNING NOTE:
//  Context = "global state" within a subtree of your component tree.
//  We combine useReducer (for complex state) with createContext
//  (to share that state everywhere without prop-drilling).
//
//  Pattern: Context provides state + dispatch.
//  Components never call dispatch directly — they use the
//  custom hook (useCheckout) which gives them clean actions.
// ============================================================

import { createContext, useReducer } from 'react';
import checkoutReducer, { initialCheckoutState } from './checkout.reducer';

// 1️⃣ Create the context with a default value (useful for TypeScript)
export const CheckoutContext = createContext({
  state: initialCheckoutState,
  dispatch: () => {},
});

// 2️⃣ The Provider wraps whatever needs access to checkout state
const CheckoutProvider = ({ children }) => {
  const [state, dispatch] = useReducer(checkoutReducer, initialCheckoutState);

  return (
    <CheckoutContext.Provider value={{ state, dispatch }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export default CheckoutProvider;
// ============================================================
//  CHECKOUT REDUCER
//  Single source of truth for all checkout state.
// ============================================================

export const CHECKOUT_STEPS = {
    ADDRESS:  'address',
    SHIPPING:  'shipping',
    PAYMENT:   'payment',
    REVIEW:    'review',
};

export const CHECKOUT_ACTIONS = {
    // Step navigation
    SET_STEP:  'SET_STEP',
    NEXT_STEP: 'NEXT_STEP',
    PREV_STEP: 'PREV_STEP',

    // Address
    SET_ADDRESS:          'SET_ADDRESS',
    SET_ADDRESS_FIELD:    'SET_ADDRESS_FIELD',
    SELECT_SAVED_ADDRESS: 'SELECT_SAVED_ADDRESS',

    // Shipping
    SET_SHIPPING_METHOD: 'SET_SHIPPING_METHOD',

    // Payment
    SET_PAYMENT_METHOD: 'SET_PAYMENT_METHOD',

    // Coupon
    APPLY_COUPON:  'APPLY_COUPON',
    REMOVE_COUPON: 'REMOVE_COUPON',

    // Async
    SET_LOADING: 'SET_LOADING',
    SET_ERROR:   'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',

    // Success
    ORDER_SUCCESS: 'ORDER_SUCCESS',

    // Reset
    RESET: 'RESET',
};

const STEP_ORDER = [
    CHECKOUT_STEPS.ADDRESS,
    CHECKOUT_STEPS.SHIPPING,
    CHECKOUT_STEPS.PAYMENT,
    CHECKOUT_STEPS.REVIEW,
];

export const initialCheckoutState = {
    currentStep:    CHECKOUT_STEPS.ADDRESS,

    address: {
        firstName:         '',
        lastName:          '',
        email:             '',
        phone:             '',
        street:            '',
        city:              '',
        state:             '',
        postalCode:        '',
        country:           'Pakistan',
        saveAddress:       false,
        selectedAddressId: null,
    },

    shippingMethod: 'standard',
    paymentMethod:  'cod',

    coupon:  null,
    loading: false,
    error:   null,

    placedOrder: null,
};

const checkoutReducer = (state, action) => {
    switch (action.type) {

        case CHECKOUT_ACTIONS.SET_STEP:
            return { ...state, currentStep: action.payload };

        case CHECKOUT_ACTIONS.NEXT_STEP: {
            const idx      = STEP_ORDER.indexOf(state.currentStep);
            const nextStep = STEP_ORDER[idx + 1];
            if (!nextStep) return state;
            return { ...state, currentStep: nextStep, error: null };
        }

        case CHECKOUT_ACTIONS.PREV_STEP: {
            const idx      = STEP_ORDER.indexOf(state.currentStep);
            const prevStep = STEP_ORDER[idx - 1];
            if (!prevStep) return state;
            return { ...state, currentStep: prevStep, error: null };
        }

        case CHECKOUT_ACTIONS.SET_ADDRESS:
            return { ...state, address: { ...state.address, ...action.payload } };

        case CHECKOUT_ACTIONS.SET_ADDRESS_FIELD:
            return {
                ...state,
                address: { ...state.address, [action.payload.field]: action.payload.value },
            };

        case CHECKOUT_ACTIONS.SELECT_SAVED_ADDRESS:
            return {
                ...state,
                address: {
                    ...action.payload,
                    saveAddress:       false,
                    selectedAddressId: action.payload._id,
                },
            };

        case CHECKOUT_ACTIONS.SET_SHIPPING_METHOD:
            return { ...state, shippingMethod: action.payload };

        case CHECKOUT_ACTIONS.SET_PAYMENT_METHOD:
            return { ...state, paymentMethod: action.payload };

        case CHECKOUT_ACTIONS.APPLY_COUPON:
            return { ...state, coupon: action.payload };

        case CHECKOUT_ACTIONS.REMOVE_COUPON:
            return { ...state, coupon: null };

        case CHECKOUT_ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload };

        case CHECKOUT_ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, loading: false };

        case CHECKOUT_ACTIONS.CLEAR_ERROR:
            return { ...state, error: null };

        case CHECKOUT_ACTIONS.ORDER_SUCCESS:
            return { ...state, placedOrder: action.payload, loading: false, error: null };

        case CHECKOUT_ACTIONS.RESET:
            return { ...initialCheckoutState };

        default:
            throw new Error(`Unknown checkout action: ${action.type}`);
    }
};

export default checkoutReducer;
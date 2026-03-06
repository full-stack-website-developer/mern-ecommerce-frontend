// ============================================================
//  ShippingAddressForm
//
//  🎓 LEARNING NOTE:
//  This component handles TWO modes:
//  1. Guest: Shows full form (name, email, phone, address...)
//  2. Logged-in user: Shows saved addresses to pick from,
//     OR shows form to enter a new one.
//
//  How does it know which? It uses useCheckout() which exposes
//  { isGuest, user }. That's the guest/logged-in detection.
// ============================================================

import { useEffect, useState } from 'react';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Checkbox from '../../../components/common/Checkbox';
import useCheckout from '../hooks/useCheckout';
import checkoutService from '../../../services/checkout.service';
import { isAddressValid } from '../checkout.selectors';

const ShippingAddressForm = () => {
  const { state, isGuest, user, setAddressField, setAddress, selectSavedAddress, nextStep } = useCheckout();
  const { address } = state;

  // Saved addresses for logged-in users
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);

  // 🎓 LEARNING NOTE: useEffect runs AFTER render.
  // When user logs in (user?.id changes), fetch their saved addresses.
  useEffect(() => {
    if (!user?.id) return;

    const fetchAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const res = await checkoutService.getSavedAddresses(user.id);
        setSavedAddresses(res.data?.addresses || []);
        // If they have saved addresses, don't show the form by default
        if (res.data?.addresses?.length > 0) setShowNewForm(false);
        else setShowNewForm(true);
      } catch {
        setShowNewForm(true);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [user?.id]);

  const handleChange = (e) => {
    setAddressField(e.target.name, e.target.value);
  };

  const handleContinue = (e) => {
    e.preventDefault();
    const usingSavedAddress = !!state.address.selectedAddressId;

    if (!isAddressValid(address, { isGuest, usingSavedAddress })) return;
    nextStep();
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-6">
        {isGuest ? '📍 Shipping Address' : '📍 Select or Enter Address'}
      </h2>

      {/* ——— LOGGED IN: Saved Address Selector ——— */}
      {!isGuest && !loadingAddresses && savedAddresses.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-3">Your saved addresses:</p>
          <div className="space-y-3">
            {savedAddresses.map((addr) => (
              <label
                key={addr._id}
                className={`
                  flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition
                  ${state.address.selectedAddressId === addr._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-400'}
                `}
              >
                <input
                  type="radio"
                  name="savedAddress"
                  className="mt-1"
                  checked={state.address.selectedAddressId === addr._id}
                  onChange={() => selectSavedAddress(addr)}
                />
                <div className="text-sm">
                  <p className="font-medium">{addr.street}</p>
                  <p className="text-gray-500">{addr.city}, {addr.state} {addr.postalCode}</p>
                  <p className="text-gray-500">{addr.country}</p>
                </div>
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setShowNewForm(!showNewForm);
              setAddress({ selectedAddressId: null }); // deselect saved
            }}
            className="mt-3 text-blue-600 text-sm hover:underline"
          >
            {showNewForm ? '↩ Use a saved address' : '+ Enter a new address'}
          </button>
        </div>
      )}

      {/* ——— ADDRESS FORM (Guest always sees this; Logged-in sees if toggled) ——— */}
      {(isGuest || showNewForm || savedAddresses.length === 0) && (
        <form onSubmit={handleContinue}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              value={address.firstName}
              onChange={handleChange}
              placeholder="John"
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              value={address.lastName}
              onChange={handleChange}
              placeholder="Doe"
            />

            {/* Guests must provide email; logged-in users already have one */}
            {isGuest && (
              <Input
                label="Email"
                name="email"
                type="email"
                value={address.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="md:col-span-2"
                required
              />
            )}

            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={address.phone}
              onChange={handleChange}
              placeholder="03001234567"
              className="md:col-span-2"
              required
            />
            <Input
              label="Street Address"
              name="street"
              value={address.street}
              onChange={handleChange}
              placeholder="123 Main St"
              className="md:col-span-2"
              required
            />
            <Input
              label="City"
              name="city"
              value={address.city}
              onChange={handleChange}
              placeholder="Lahore"
              required
            />
            <Input
              label="State / Province"
              name="state"
              value={address.state}
              onChange={handleChange}
              placeholder="Punjab"
              required
            />
            <Input
              label="Postal Code"
              name="postalCode"
              value={address.postalCode}
              onChange={handleChange}
              placeholder="54000"
            />
            <Input
              label="Country"
              name="country"
              value={address.country}
              onChange={handleChange}
              placeholder="Pakistan"
              required
            />
          </div>

          {/* Only show "save address" option for logged-in users */}
          {!isGuest && (
            <Checkbox
              label="Save this address for future orders"
              className="mt-4"
              checked={address.saveAddress}
              onChange={(e) => setAddressField('saveAddress', e.target.checked)}
            />
          )}

          <button
            type="submit"
            disabled={!isAddressValid(address, { 
              isGuest, 
              usingSavedAddress: !!state.address.selectedAddressId 
            })}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300
                       text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Continue to Shipping →
          </button>
        </form>
      )}

      {/* Logged-in user selected a saved address, show continue */}
      {!isGuest && !showNewForm && state.address.selectedAddressId && (
        <button
          onClick={nextStep}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white
                     font-semibold py-3 px-6 rounded-lg transition"
        >
          Continue to Shipping →
        </button>
      )}
    </Card>
  );
};

export default ShippingAddressForm;
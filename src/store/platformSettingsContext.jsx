import { createContext, useEffect, useMemo, useState } from 'react';
import dashboardService from '../services/dashboard.service';

export const DEFAULT_PLATFORM_SETTINGS = {
  gateway: 'stripe',
  currency: 'USD',
  defaultShippingCost: 10,
  freeShippingThreshold: 100,
  taxRate: 10,
  siteName: 'Ecommerce',
  supportEmail: '',
  supportPhone: '',
};

export const PlatformSettingsContext = createContext({
  settings: DEFAULT_PLATFORM_SETTINGS,
  loading: true,
  reload: async () => {},
});

const normalizePlatformSettings = (value = {}) => ({
  ...DEFAULT_PLATFORM_SETTINGS,
  ...value,
  gateway: String(value.gateway ?? DEFAULT_PLATFORM_SETTINGS.gateway).toLowerCase(),
  currency: String(value.currency ?? DEFAULT_PLATFORM_SETTINGS.currency).toUpperCase(),
  defaultShippingCost: Number(value.defaultShippingCost ?? DEFAULT_PLATFORM_SETTINGS.defaultShippingCost),
  freeShippingThreshold: Number(value.freeShippingThreshold ?? DEFAULT_PLATFORM_SETTINGS.freeShippingThreshold),
  taxRate: Number(value.taxRate ?? DEFAULT_PLATFORM_SETTINGS.taxRate),
  siteName: String(value.siteName ?? DEFAULT_PLATFORM_SETTINGS.siteName),
  supportEmail: String(value.supportEmail ?? DEFAULT_PLATFORM_SETTINGS.supportEmail),
  supportPhone: String(value.supportPhone ?? DEFAULT_PLATFORM_SETTINGS.supportPhone),
});

const PlatformSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_PLATFORM_SETTINGS);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await dashboardService.getPublicPlatformSettings();
      if (res.success) {
        setSettings(normalizePlatformSettings(res.data.platform));
      }
    } catch (_err) {
      setSettings(DEFAULT_PLATFORM_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const value = useMemo(
    () => ({
      settings,
      loading,
      reload: load,
    }),
    [settings, loading]
  );

  return <PlatformSettingsContext.Provider value={value}>{children}</PlatformSettingsContext.Provider>;
};

export default PlatformSettingsProvider;

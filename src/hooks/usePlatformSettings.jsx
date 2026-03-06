import { useContext } from 'react';
import { PlatformSettingsContext } from '../store/platformSettingsContext';

const usePlatformSettings = () => useContext(PlatformSettingsContext);

export default usePlatformSettings;

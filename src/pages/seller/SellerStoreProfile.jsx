import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Store, AtSign, MapPin } from 'lucide-react';
import SellerLayout from '../../components/layout/SellerLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import dashboardService from '../../services/dashboard.service';

const defaultProfile = {
    storeName: '',
    storeSlug: '',
    contactEmail: '',
    phone: '',
    businessAddress: '',
    storeDescription: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+()\-\s]{7,20}$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const toSlug = (value = '') =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

const SellerStoreProfile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [profile, setProfile] = useState(defaultProfile);
    const [initialProfile, setInitialProfile] = useState(defaultProfile);
    const [errors, setErrors] = useState({});

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            const res = await dashboardService.getSellerSettings();
            if (!res?.success) throw new Error('Failed to load store profile');
            const nextProfile = {
                ...defaultProfile,
                ...(res.data?.settings?.profile || {}),
            };
            setProfile(nextProfile);
            setInitialProfile(nextProfile);
            setErrors({});
        } catch (err) {
            const message = err?.message || 'Failed to load profile';
            setLoadError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const updateField = (key, value) => {
        setProfile((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: '' }));
    };

    const validate = (value) => {
        const validationErrors = {};

        const storeName = value.storeName.trim();
        const storeSlug = value.storeSlug.trim();
        const contactEmail = value.contactEmail.trim();
        const phone = value.phone.trim();
        const businessAddress = value.businessAddress.trim();
        const storeDescription = value.storeDescription.trim();
        if (!storeName) validationErrors.storeName = 'Store name is required';
        else if (storeName.length < 2) validationErrors.storeName = 'Store name must be at least 2 characters';
        else if (storeName.length > 80) validationErrors.storeName = 'Store name cannot exceed 80 characters';

        if (!storeSlug) validationErrors.storeSlug = 'Store slug is required';
        else if (!SLUG_REGEX.test(storeSlug)) {
            validationErrors.storeSlug = 'Use lowercase letters, numbers, and hyphens only';
        }

        if (!contactEmail) validationErrors.contactEmail = 'Contact email is required';
        else if (!EMAIL_REGEX.test(contactEmail)) validationErrors.contactEmail = 'Enter a valid email address';

        if (phone && !PHONE_REGEX.test(phone)) validationErrors.phone = 'Enter a valid phone number';

        if (!businessAddress) validationErrors.businessAddress = 'Business address is required';
        else if (businessAddress.length < 8) validationErrors.businessAddress = 'Address is too short';

        if (!storeDescription) validationErrors.storeDescription = 'Store description is required';
        else if (storeDescription.length < 20) validationErrors.storeDescription = 'Description must be at least 20 characters';
        else if (storeDescription.length > 500) validationErrors.storeDescription = 'Description cannot exceed 500 characters';

        return validationErrors;
    };

    const isDirty = useMemo(() => JSON.stringify(profile) !== JSON.stringify(initialProfile), [profile, initialProfile]);

    const completion = useMemo(() => {
        const fields = [
            Boolean(profile.storeName.trim()),
            Boolean(profile.storeSlug.trim()),
            Boolean(profile.contactEmail.trim()),
            Boolean(profile.businessAddress.trim()),
            Boolean(profile.storeDescription.trim()),
        ];
        const completed = fields.filter(Boolean).length;
        return Math.round((completed / fields.length) * 100);
    }, [profile]);

    const save = async () => {
        const normalizedPayload = {
            ...profile,
            storeName: profile.storeName.trim(),
            storeSlug: toSlug(profile.storeSlug),
            contactEmail: profile.contactEmail.trim().toLowerCase(),
            phone: profile.phone.trim(),
            businessAddress: profile.businessAddress.trim(),
            storeDescription: profile.storeDescription.trim(),
        };

        const validationErrors = validate(normalizedPayload);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error('Please fix validation errors before saving');
            return;
        }

        setSaving(true);
        try {
            const res = await dashboardService.updateSellerProfile(normalizedPayload);
            if (res.success) {
                setProfile(normalizedPayload);
                setInitialProfile(normalizedPayload);
                setErrors({});
                toast.success('Store profile saved');
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SellerLayout>
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold">Store Profile & Customization</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage your public store identity and business contact details</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm">
                        Profile completion: <span className="font-semibold">{completion}%</span>
                    </div>
                </div>

                {loadError && (
                    <Card className="border border-red-200 bg-red-50">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-red-700">{loadError}</p>
                            <Button variant="secondary" onClick={loadProfile}>Retry</Button>
                        </div>
                    </Card>
                )}

                <Card>
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <Store className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Store Information</h2>
                            <p className="text-xs text-gray-500">Basic details visible to customers</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Input
                            label="Store Name"
                            value={profile.storeName}
                            onChange={(e) => {
                                const nextName = e.target.value;
                                updateField('storeName', nextName);
                                if (!profile.storeSlug.trim()) updateField('storeSlug', toSlug(nextName));
                            }}
                            error={errors.storeName || false}
                            required
                        />
                        <Input
                            label="Store URL Slug"
                            value={profile.storeSlug}
                            onChange={(e) => updateField('storeSlug', toSlug(e.target.value))}
                            onBlur={() => updateField('storeSlug', toSlug(profile.storeSlug))}
                            placeholder="my-store-name"
                            error={errors.storeSlug || false}
                            required
                        />
                        <Input
                            label="Contact Email"
                            type="email"
                            className="md:col-span-2"
                            value={profile.contactEmail}
                            onChange={(e) => updateField('contactEmail', e.target.value)}
                            error={errors.contactEmail || false}
                            required
                        />
                        <Input
                            label="Phone"
                            value={profile.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            error={errors.phone || false}
                        />
                        <Input
                            label="Business Address"
                            className="md:col-span-2"
                            value={profile.businessAddress}
                            onChange={(e) => updateField('businessAddress', e.target.value)}
                            error={errors.businessAddress || false}
                            required
                        />
                    </div>
                    <Textarea
                        label="Store Description"
                        rows={5}
                        value={profile.storeDescription}
                        onChange={(e) => updateField('storeDescription', e.target.value)}
                        error={errors.storeDescription || false}
                        required
                    />
                    <p className="mt-2 text-xs text-gray-500">{profile.storeDescription.length}/500 characters</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <Button variant="primary" onClick={save} disabled={loading || saving || !isDirty}>
                            {saving ? 'Saving...' : 'Save Store Profile'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setProfile(initialProfile);
                                setErrors({});
                            }}
                            disabled={loading || saving || !isDirty}
                        >
                            Discard Changes
                        </Button>
                    </div>
                </Card>

                <Card className="border border-gray-100 bg-gray-50">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="inline-flex items-center gap-2">
                            <AtSign className="h-4 w-4 text-gray-500" />
                            Public email: <span className="font-medium text-gray-800">{profile.contactEmail || 'Not set'}</span>
                        </div>
                        <div className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            Address: <span className="font-medium text-gray-800">{profile.businessAddress || 'Not set'}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </SellerLayout>
    );
};

export default SellerStoreProfile;

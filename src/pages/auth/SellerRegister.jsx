import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Checkbox from '../../components/common/Checkbox';
import Button from '../../components/common/Button';
import { Store, Banknote, CheckCircle2, AlertCircle, ShieldCheck, Camera } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import sellerService from '../../services/seller.service';
import { Navigate, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/api.client';
import useUserContext from '../../hooks/useUserContext';
import FullPageLoader from '../../components/common/FullPageLoader';

const SellerRegister = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, control } = useForm();
  const [ licenseDocPreview, setLicenseDocPreview ] = useState(null);
  const [ logoPreview, setLogoPreview ] = useState();
  const [ logo, setLogo ] = useState();
  const [ licenseDoc, setLicenseDoc ] = useState();
  const navigate = useNavigate();
  const { user, setUser, loading } = useUserContext();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace/>
  }

  if (user?.seller?.status === 'pending') {
    navigate("/seller/pending-approval");
    return;
  }

  if (user?.isSeller) {
    return <Navigate to="/seller/login" />;
  }

  async function onSubmit(values) {
    const formData = new FormData();
    formData.append('logo', logo);
    formData.append('licenseDoc', licenseDoc);

    const { logo: _l, licenseDoc: _d, ...otherValues } = values;
    formData.append('values', JSON.stringify(otherValues));

    try {
      const res = await sellerService.register(formData);
      if(res.success) {
        const user = res.data.user;
        setUser(prevUser => ({ ...prevUser, ...user, seller: { ...res.data.seller } }));
        navigate('/seller/pending-approval');
      }
    } catch (error) {
      console.log(error);
    }
  }

  function handleLiscense(e) {
    const file = e.target.files[0];
    setLicenseDocPreview(URL.createObjectURL(file));
    setLicenseDoc(file);
  }

  function handleLogo(e) {
    const file = e.target.files[0];
    setLogoPreview(URL.createObjectURL(file));
    setLogo(file);
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <header className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-xs font-medium text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              Secure seller onboarding 
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              Create your seller account
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-2xl mx-auto">
              A modern, multi-step registration flow inspired by leading marketplaces.
            </p>
          </header>

          <div className="space-y-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card className="bg-white shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Business Details
                        </h2>
                        <p className="text-xs text-gray-500">
                            Information about your store and legal entity.
                        </p>
                      </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Logo
                      <span className="ms-1 text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <img
                        className="w-24 h-24 rounded-full object-cover ring-2 ring-gray-200"
                        src={logoPreview || 'https://static.vecteezy.com/system/resources/thumbnails/020/662/327/small/store-icon-logo-illustration-vector.jpg'}
                      />
                      
                      <label
                        htmlFor="logo"
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 
                                  rounded-full flex items-center justify-center cursor-pointer
                                  transition-all duration-300"
                      >
                        <Camera
                          className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          size={32}
                        />
                      </label>
                      <Controller 
                        name="logo"
                        control={control}
                        rules={{ required: 'Logo is Required' }}
                        render={({field}) => (
                          <Input 
                            type='file'
                            id='logo'
                            hidden
                            onChange={e => {
                              field.onChange(e.target.files[0]);
                              handleLogo(e);
                            }}
                          />
                        )}
                      />
                    </div>
                    {
                      errors?.logo && 
                      <span className="ms-1 text-sm text-red-500">{ errors.logo.message }</span>
                    }
                  </div>
                  <Input
                      label="Store Name"
                      placeholder="My Awesome Store"
                      {
                        ...register('storeName', { 
                          // required: 'Store Name is required' 
                        })
                      }
                      error={errors.storeName ? errors.storeName.message : false}
                  />
                  <Input
                      label="Business License / Tax ID Number"
                      placeholder="123456789"
                      {
                        ...register('licenseId', { 
                          // required: 'License ID is required' 
                        })
                      }
                      error={errors.licenseId ? errors.licenseId.message : false}
                      
                  />
                  <Select
                      label="Business Type"
                      options={[
                      { value: '', label: 'Select business type' },
                      { value: 'sole', label: 'Sole Proprietorship' },
                      { value: 'partnership', label: 'Partnership' },
                      { value: 'llc', label: 'LLC' },
                      { value: 'corp', label: 'Corporation' },
                      ]}
                      {
                        ...register('businessType', { 
                        // required: 'Business Type is required' 
                      })
                      }
                      error={errors.businessType ? errors.businessType.message : false}
                  />
                  <Input
                      label="Store Description"
                      placeholder="Short description of your products and brand."
                      className="md:col-span-1"
                      {
                        ...register('storeDescription')
                      }
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                    label="Business Address - Street"
                    placeholder="123 Market Street"
                    {
                      ...register('street', { 
                        // required: 'Street is required' 
                      })
                    }
                    error={errors.street ? errors.street.message : false}
                />
                <Input
                    label="City"
                    placeholder="San Francisco"
                    {
                      ...register('city', { 
                        // required: 'City is required' 
                      })
                    }
                    error={errors.city ? errors.city.message : false}
                />
                <Input 
                  label="State / Province" 
                  placeholder="CA" 
                  {
                    ...register('state', { 
                      // required: 'State is required' 
                    })
                  }
                  error={errors.state ? errors.state.message : false}
                />
                <Input 
                  label="ZIP / Postal Code" 
                  placeholder="94103" 
                  {
                    ...register('postalCode', { 
                      // required: 'Postal Code is required' 
                    })
                  }
                  error={errors.postalCode ? errors.postalCode.message : false}
                />
                <Select
                  label="Country"
                  options={[
                  { value: '', label: 'Select country' },
                  { value: 'us', label: 'United States' },
                  { value: 'uk', label: 'United Kingdom' },
                  { value: 'pk', label: 'Pakistan' },
                  { value: 'in', label: 'India' },
                  ]}
                  {
                    ...register('country', { 
                      // required: 'Country is required' 
                    })
                  }
                  error={errors.country ? errors.country.message : false}
                />
                </div>

                  {/* Business license upload placeholder */}
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                      Business License Document
                  </label>
                  <div className="mt-6 mb-4">
                    <img src={licenseDocPreview || 'https://static.vecteezy.com/system/resources/thumbnails/075/546/435/small/minimal-outline-icon-of-user-profile-card-interface-component-vector.jpg'} alt="" width={100} height={100}/>
                  </div>
                  <div className="d-flex ">
                    <Controller
                      name="licenseDoc"
                      control={control}
                      rules={{ required: "License Document is required" }}
                      render={({ field }) => (
                        <>
                          <Input
                            id="licenseDoc"
                            type="file"
                            hidden
                            className='mb-2'
                            onChange={(e) => {
                              const file = e.target.files[0];
                              field.onChange(file);
                              handleLiscense(e);
                            }}
                            error={errors.licenseDoc ? errors.licenseDoc.message : false}
                          />
                          
                          <label
                            htmlFor="licenseDoc"
                            className="px-6 mt-3 py-2 rounded-lg font-medium transition-colors
                                      focus:outline-none focus:ring-2 focus:ring-offset-2
                                      border-2 border-primary-600 text-primary-600
                                      hover:bg-primary-50 focus:ring-primary-500 inline-block"
                          >
                            Upload Document
                          </label>
                        </>
                      )}
                    />
                  </div>
                </div>
                <div className="my-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Banknote className="h-5 w-5" />
                      </div>
                      <div>
                      <h2 className="text-lg font-bold text-gray-900">
                          Bank Details
                      </h2>
                      <p className="text-xs text-gray-500">
                          Where your payouts will go.
                      </p>
                      </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Account Holder Name"
                    placeholder="As per bank record"
                    // required
                    {
                      ...register('bankHolderName', { 
                        // required: 'Bank Holder Name is required' 
                      })
                    }
                    error={errors.bankHolderName ? errors.bankHolderName.message : false}
                  />
                  <Input 
                    label="Bank Name" 
                    placeholder="Example Bank" 
                    {
                      ...register('bankName', { 
                        // required: 'Bank Name is required' 
                      })
                    }
                    error={errors.bankName ? errors.bankName.message : false}
                  />
                  <Input
                    label="Account Number"
                    placeholder="••••••••••••"
                    // required
                    {
                      ...register('iban', { 
                        // required: 'Account Number is required' 
                      })
                    }
                    error={errors.iban ? errors.iban.message : false}
                  />
                  <Input
                      label="CVC"
                      placeholder="123456789 (UI only)"
                      {
                        ...register('cvc', { 
                          // required: 'CVC is required' 
                        })
                      }
                      error={errors.cvc ? errors.cvc.message : false}
                  />
                  <Select
                    label="Account Type"
                    options={[
                    { value: '', label: 'Select account type' },
                    { value: 'savings', label: 'Savings' },
                    { value: 'checking', label: 'Checking' },
                    ]}
                    {
                      ...register('bankAccType', { 
                        // required: 'Account Type is required' 
                      })
                    }
                    error={errors.bankAccType ? errors.bankAccType.message : false}
                  />
                </div>

                <p className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                <AlertCircle className="h-3 w-3 text-yellow-500" />
                    Banking integration, validation, and encryption will be implemented separately.
                </p>

                <div className="mt-5 grid gap-4 border-t pt-4 md:grid-cols-5 md:items-center">
                  <div className="md:col-span-3">
                    <Checkbox
                      label="I agree to the Seller Terms & Conditions."
                      {...register('terms', { 
                        // required: 'You must accept the terms and conditions' 
                      })}
                      error={errors.terms ? errors.terms.message : false}
                    />
                  </div>
                  <div className="flex justify-end gap-2 md:col-span-2">
                    <Button variant="secondary">Back</Button>
                    <Button variant="primary" className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                      { isSubmitting ? 'Submitting...' : 'Submit Application' }
                    </Button>
                  </div>
                </div>
              </Card>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SellerRegister;


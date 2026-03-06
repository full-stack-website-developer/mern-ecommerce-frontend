import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Store, Briefcase, Mail, Lock, AlertTriangle, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Checkbox from '../../components/common/Checkbox';
import useUserContext from '../../hooks/useUserContext';
import FullPageLoader from '../../components/common/FullPageLoader';
import Unauthorized from '../Unauthorized';
import { useForm } from 'react-hook-form';
import authService from '../../services/auth.service';
import userService from '../../services/user.service';
import { ApiError } from '../../api/api.client';

const SellerLogin = () => {
  const { user, setUser, loading } = useUserContext();
  const { register, handleSubmit, formState: { errors }, setError } = useForm();
  const navigate = useNavigate();

  if (loading) {
    return <FullPageLoader />
  }

  if (user?.seller?.status === 'pending') {
    return <Navigate to="/seller/pending-approval" replace />;
  }

  if (user?.seller?.status === 'rejected') {
    return <Unauthorized />;
  }

  if (user?.role === 'seller') {
    return <Navigate to="/seller" replace />;
  }

  if (user && user?.role !== 'seller' ) {
    return <Unauthorized />
  }



  async function onSubmit({ email, password }) {
    try {
      const res = await authService.login({ email, password });
      if (res.data.user.role !== 'seller') {
        setError('root', {
          type: 'server',
          message: 'This account does not have seller access.',
        });
        return;
      }

      const meRes = await userService.getUser();
      const resolvedUser = meRes?.success
        ? { ...meRes.data.user, seller: { ...meRes.data.seller } }
        : res.data.user;

      setUser(resolvedUser);

      if (resolvedUser?.seller?.status === 'rejected') {
        setError('root', {
          type: 'server',
          message: 'Your seller account is rejected. Please contact support.',
        });
        return;
      }

      navigate('/seller');
    } catch(err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
            setError('password', {
                type: 'server',
                message: err.message
            });
        } else {
            setError('root', {
                type: 'server',
                message: err.message
            });
        }
      }
    }
  }
  

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid gap-10 md:grid-cols-2 items-stretch">
          {/* LEFT COLUMN – SELLER LOGIN FORM */}
          <div className="flex items-center">
            <Card className="w-full border border-gray-100 shadow-sm">
              {/* Header */}
              <header className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  <Store className="h-4 w-4" />
                  <span>Seller Portal</span>
                </div>
                <h1 className="mt-4 text-2xl font-bold text-gray-900">
                  Access your store dashboard
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Log in to manage your products, orders, payouts, and performance across the marketplace.
                </p>
              </header>

              {/* Alert UI (static examples) */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="font-semibold">Your account is pending approval</p>
                    <p className="mt-0.5 text-[11px]">
                      Once approved by our team, you&apos;ll receive an email and gain full access to the seller dashboard.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-red-500" />
                  <div>
                    <p className="font-semibold">
                      Your application was rejected. Contact support.
                    </p>
                    <p className="mt-0.5 text-[11px]">
                      This is a visual alert only. Actual status handling and support contact flow will be added later.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form – UI only, no logic */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {errors.root?.message && (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {errors.root.message}
                  </p>
                )}
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Mail className="h-4 w-4 text-indigo-500" />
                    <span>Email</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="business@yourstore.com"
                    className="mt-1"
                    { 
                      ...register('email', {
                        required: "Email is Required!",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i,
                          message: 'Please enter a valid email address'
                        },
                      })
                    }
                    error = {errors.email ? errors.email.message : false} 
                    // required
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Lock className="h-4 w-4 text-indigo-500" />
                    <span>Password</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className="mt-1"
                    {
                      ...register('password', {
                        required: 'Password is required!',
                      })
                    }
                    error={errors.password ? errors.password.message : false}
                    // required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Checkbox
                    label="Remember me on this device"
                    className="text-sm"
                  />
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white"
                >
                  Login to Dashboard
                </Button>
              </form>

              {/* Links & microcopy */}
              <div className="mt-6 space-y-2 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium text-gray-900">
                    Not a seller yet?
                  </span>{' '}
                  <Link
                    to="/seller/register"
                    className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    Apply Now &rarr;
                  </Link>
                </p>
                <p className="text-xs text-gray-500">
                  Looking for customer login?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    Click here
                  </Link>
                </p>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN – BUSINESS ILLUSTRATION / BRAND PANEL */}
          <div className="hidden md:flex items-center">
            <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-8 text-indigo-50 shadow-lg">
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-purple-400/20 blur-3xl" />

              <div className="relative space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  <Briefcase className="h-4 w-4" />
                  <span>Multi-vendor Seller Portal</span>
                </div>

                <h2 className="text-2xl font-bold leading-snug">
                  Manage your brand, products, and orders in one place.
                </h2>

                <p className="text-sm text-indigo-100/90">
                  Track performance, monitor payouts, and deliver a world-class experience to your customers with
                  a professional seller dashboard built for growth.
                </p>

                {/* Simple illustration blocks */}
                <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-indigo-200">
                      Today&apos;s revenue
                    </p>
                    <p className="mt-1 text-lg font-semibold">$1,240.50</p>
                    <p className="mt-1 text-[11px] text-emerald-200">
                      +12.4% vs yesterday
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-indigo-200">
                      Orders
                    </p>
                    <p className="mt-1 text-lg font-semibold">48</p>
                    <p className="mt-1 text-[11px] text-indigo-100">
                      Across 5 active channels
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-indigo-200">
                      Store rating
                    </p>
                    <p className="mt-1 text-lg font-semibold">4.8</p>
                    <p className="mt-1 text-[11px] text-indigo-100">
                      Based on 320+ reviews
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-[11px] text-indigo-100/80">
                  This panel is an illustration only. Data, charts, and live KPIs will be connected to
                  your actual seller account in the implementation phase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerLogin;

import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  AlertTriangle,
  Fingerprint,
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Checkbox from '../../components/common/Checkbox';
import Button from '../../components/common/Button';
import useUserContext from '../../hooks/useUserContext';
import FullPageLoader from '../../components/common/FullPageLoader';
import Unauthorized from '../Unauthorized';
import { useForm } from 'react-hook-form';
import authService from '../../services/auth.service';
import { ApiError } from '../../api/api.client';

const AdminLogin = () => {
  const { user, setUser, loading } = useUserContext();
  const { register, handleSubmit, formState: { errors }, setError } = useForm();
  const navigate = useNavigate();

  if (loading) {
    return <FullPageLoader />
  }
  
  if (user?.role !== 'admin') {
    return <Unauthorized />
  }

  async function onSubmit({ email, password }) {
    try {
      const res = await authService.login({ email, password });
      setUser(res.data.user)
      navigate('/admin/');
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
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="flex items-center justify-center px-4">
        <Card className="w-full max-w-md border border-gray-800 bg-gray-900/90 text-gray-100 shadow-lg">
          {/* Header & security indicators */}
          <header className="mb-8 text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
              <Lock className="h-3.5 w-3.5" />
              <span>SSL Secured Connection</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800 text-indigo-400">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Admin Portal
                </h1>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-400">
                  Authorized Personnel Only
                </p>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] text-amber-200">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>All admin activities are logged and monitored</span>
            </div>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-300">
                Email
              </label>
              <Input
                type="email"
                placeholder="admin@yourcompany.com"
                className="bg-gray-900 border border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                autoComplete="email"
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
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-300">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                className="bg-gray-900 border border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                autoComplete="current-password"
                {
                  ...register('password', {
                    required: 'Password is required!',
                  })
                }
                error={errors.password ? errors.password.message : false}
                required
              />
            </div>

            <div className="space-y-2 rounded-lg border border-gray-800 bg-gray-900/60 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-medium text-gray-200">
                    Two-Factor Authentication
                  </span>
                </div>
                <Checkbox
                  label="Enable 2FA"
                  className="text-[11px] text-gray-300"
                />
              </div>
              <div className="mt-2 space-y-1">
                <label className="block text-[11px] font-medium text-gray-400">
                  2FA Code (optional)
                </label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  className="bg-gray-900 border border-gray-800 text-gray-100 placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <p className="mt-1 text-[11px] text-gray-500">
                  Use a code from your authenticator app if 2FA is enabled for this account.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-[11px] text-gray-500">
                <span className="inline-flex items-center gap-1 rounded-full border border-gray-700 px-2 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Protected Area</span>
                </span>
              </div>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              variant="primary"
              className="mt-1 w-full border border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700 hover:border-gray-600"
            >
              Secure Login
            </Button>
          </form>

          {/* Session / device info */}
          <div className="mt-8 rounded-lg border border-gray-800 bg-gray-900/70 px-4 py-3">
            <p className="flex items-center gap-2 text-xs font-medium text-gray-300">
              <Shield className="h-3.5 w-3.5 text-indigo-400" />
              <span>Last Access Details</span>
            </p>
            <div className="mt-2 space-y-1.5 text-[11px] text-gray-400">
              <p>
                <span className="font-medium text-gray-300">
                  Last successful login:
                </span>{' '}
                Jan 15, 2024, 2:30 PM
              </p>
              <p>
                <span className="font-medium text-gray-300">IP Address:</span>{' '}
                192.168.1.1
              </p>
              <p>
                <span className="font-medium text-gray-300">Browser:</span>{' '}
                Chrome on Windows
              </p>
            </div>
            <p className="mt-2 text-[10px] text-gray-500">
              This information is displayed for security awareness only. Actual session tracking and device
              recognition will be implemented in the backend.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;


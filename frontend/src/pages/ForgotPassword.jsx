import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { useState } from 'react';
import authService from '../services/auth.service';
import { useForm } from 'react-hook-form';
import { ApiError } from '../api/api.client';

const ForgotPassword = () => {
  const { register, handleSubmit, formState, setError } = useForm();
  const { errors, isSubmitting } = formState;
  const navigate = useNavigate();

  async function onSubmit({ email }) {
    try {
      const res = await authService.forgotPassword({ email });

      if (res?.success) {
        navigate(`/verify-otp/${encodeURIComponent(email)}`);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError('email', { 
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
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <h1 className="text-3xl font-bold text-center mb-4">Forgot Password</h1>
            <p className="text-gray-600 text-center mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
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
              />

              <Button variant="primary" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send OTP' } 
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-primary-600 hover:underline font-medium">
                Back to Login
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ForgotPassword;

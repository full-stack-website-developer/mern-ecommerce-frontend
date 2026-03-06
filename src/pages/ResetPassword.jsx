import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import authService from '../services/auth.service';
import { useForm } from 'react-hook-form';

const ResetPassword = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState, setError } = useForm();
  const { errors, isSubmitting } = formState;


  async function onSubmit({ password, confirmPassword }) {

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const res = await authService.changePassword(decodeURIComponent(email || ''), password, confirmPassword);
      if (res && res.success) {
        // Go to login after password reset
        navigate('/login');
      }
    } catch (err) {
      console.error('Reset password failed', err);
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <h2 className="text-2xl font-semibold mb-4">Reset Password</h2>
            <p className="text-sm text-gray-600 mb-6">Set a new password for <strong>{decodeURIComponent(email || '')}</strong></p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                {
                  ...register('password', {
                    required: 'Password is required!',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message:
                        'Password must include uppercase, lowercase, number and special character'
                    }
                  })
                }
                error={errors.password ? errors.password.message : false}
                // required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm new password"
                {
                  ...register('confirmPassword', {
                    required: 'Confirm password is required!',
                    validate: (value, formValues) =>
                      value === formValues.password || 'Passwords do not match'
                  })
                }
                error={errors.confirmPassword ? errors.confirmPassword.message : false}
                // required
              />

              <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Reset Password'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResetPassword;

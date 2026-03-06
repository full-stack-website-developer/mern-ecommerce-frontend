import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import authService from '../services/auth.service';
import { useForm } from 'react-hook-form';
import { ApiError } from '../api/api.client';

const VerifyOtp = () => {
  const { email } = useParams();
  const navigate = useNavigate();

  const { register, handleSubmit, formState, setError } = useForm();
  const { errors, isSubmitting } = formState;

  async function onSubmit({ otp }) {

    try {
      const res = await authService.verifyOTP(decodeURIComponent(email || ''), otp);
      if (res && res.success) {
        // navigate to reset password page
        navigate(`/reset-password/${encodeURIComponent(email)}`);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError('otp', {
          type: 'server',
          message: err.message,
        });
      }
      console.error('OTP verification failed', err);
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <h2 className="text-2xl font-semibold mb-4">Verify OTP</h2>
            <p className="text-sm text-gray-600 mb-6">Enter the OTP we sent to <strong>{decodeURIComponent(email || '')}</strong></p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="OTP"
                type="text"
                placeholder="Enter OTP"
                {
                  ...register('otp', { required: "OTP is Required" })
                }
                error={errors.otp ? errors.otp.message: false}
              />

              <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default VerifyOtp;

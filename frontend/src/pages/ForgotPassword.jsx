import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const ForgotPassword = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <h1 className="text-3xl font-bold text-center mb-4">Forgot Password</h1>
            <p className="text-gray-600 text-center mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <form className="space-y-6">
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
              />

              <Button variant="primary" className="w-full">
                Send Reset Link
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

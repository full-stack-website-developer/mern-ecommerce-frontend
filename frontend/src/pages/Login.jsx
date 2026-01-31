import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Divider from '../components/common/Divider';
import authService from '../services/auth.service';
import useUserContext from '../hooks/useUserContext';
import { useForm } from 'react-hook-form';
import { ApiError } from '../api/api.client';
import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

const Login = () => {
  const navigate = useNavigate();
  const [googleLoader, setGoogleLoader] = useState(false);
  const { setUser } = useUserContext();
  const { register, handleSubmit, formState, setError } = useForm({
    defaultValues: {
      'rememberMe': Boolean(authService.getRemember()),
    }
  });
  const { errors, isSubmitting } = formState;

  console.log(Boolean(authService.getRemember()))

  const responseGoogle = async (authResult) => {
  try {
      setGoogleLoader(true);
      if (authResult.code) {
        const res = await authService.googleAuth(authResult.code);
        setUser(res.data.user)
        navigate('/dashboard')
      }
    } catch (error) {
        console.log(`Error while requesting google code: ${error}`);
    } finally {
      setGoogleLoader(false);
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: 'auth-code',
  })

  async function onSubmit(values) {
    const {email, password, rememberMe} = values;

    try {
      const res = await authService.login({ email, password, rememberMe });
      setUser(res.data.user)
      navigate('/dashboard');
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
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
            
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
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                {
                    ...register('password', {
                      required: 'Password is required!',
                    })
                  }
                  error={errors.password ? errors.password.message : false}
                  required
              />
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2" 
                    {
                      ...register('rememberMe')
                    }
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button variant="primary" className="w-full" disabled={isSubmitting}>
                { isSubmitting ? 'Redirecting to Dashboard...' : 'Login' }
              </Button>
            </form>

            <Divider text="OR" className="my-6" />

            <div className="space-y-3">
              <Button variant="outline" className="w-full" onClick={googleLogin}>
                <div className="flex items-center justify-center space-x-2">
                  <img src="/images/logo/google-logo.png" width={20} alt="" />
                  <span>{googleLoader ? 'Logging with Google...' : 'Continue with Google' }</span>
                </div>
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-600 hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;

import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Divider from '../components/common/Divider';
import Checkbox from '../components/common/Checkbox';
import authService from '../services/auth.service';
import useUserContext from '../hooks/useUserContext';

const Register = () => {
  const { register, handleSubmit, formState, setError } = useForm();
  const { errors, isSubmitting } = formState;
  const { setUser } = useUserContext();
  const navigate = useNavigate();

  async function handleRegister(values) {
    const { firstName, lastName, email, phone, password, confirmPassword, terms } = values;
  
    const newUser = {
      fName: firstName,
      lName: lastName,
      email,
      phone,
      password,
      confirmPassword,
      terms,
    };

    try {
      const res = await authService.register(newUser);
      setUser(res.data.user)
      navigate('/dashboard');
    } catch(err) {
        if (err.status === 409) {
          setError('email', {
            type: 'server',
            message: err.message, 
          });
          return;
        }

      if (err.status === 400 && err.data?.errors) {
        Object.entries(err.data.errors).forEach(([field, message]) => {
          setError(field, { type: 'server', message });
        });
        return;
      }
    }
  }

  // const useTypesOptions = [
  //   { label: 'Select an Option', value: 'null'},
  //   { label: 'User', value: 'user'},
  //   { label: 'Seller', value: 'seller'},
  //   { label: 'Admin', value: 'admin'},
  // ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <h1 className="text-3xl font-bold text-center mb-8">Create Account</h1>
            
            <form className="space-y-6" onSubmit={handleSubmit(handleRegister)}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="John"
                  { ...register('firstName', {
                    required: "First Name is Required!",
                  }) }
                  error = {errors.firstName ? errors.firstName.message : false} 
                  required
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  { ...register('lastName') }
                />
              </div>

              {/* <Select 
                label="User Type"
                options={useTypesOptions}
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              /> */}
              
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
                label="Phone"
                type="tel"
                placeholder="+12345678900"
                { 
                  ...register('phone', {
                    required: "Phone number is Required!",
                    pattern: {
                      value: /^(?:\+|00)?\d{10,15}$/,
                      message: 'Please enter a valid phone number'
                    },
                  })
                }
                error = {errors.phone ? errors.phone.message : false} 
                required
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="Create a password"
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
                required
              />
              
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                {
                  ...register('confirmPassword', {
                    required: 'Confirm password is required!',
                    validate: (value, formValues) =>
                      value === formValues.password || 'Passwords do not match'
                  })
                }
                error={errors.confirmPassword ? errors.confirmPassword.message : false}
                required
              />

              <Checkbox
                label={
                  <span>
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                }

                {  
                  ...register('terms', {
                    required: "Please accept our Terms and Policies"
                  })
                }
                error = {errors.terms ? errors.terms.message : false}
                required
              />

              <Button variant="primary" className="w-full" disabled={isSubmitting}>
                { isSubmitting ? 'Redirecting to Dashboard...' : 'Create Account' }
              </Button>
            </form>

            <Divider text="OR" className="my-6" />

            <div className="space-y-3">
              <Button variant="outline" className="w-full">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign up with Google</span>
                </div>
              </Button>
              <Button variant="outline" className="w-full">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Sign up with Facebook</span>
                </div>
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:underline font-medium">
                  Login
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Register;

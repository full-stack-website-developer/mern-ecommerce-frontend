import { useForm } from "react-hook-form";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import Input from "../../../components/common/Input";
import useUserContext from "../../../hooks/useUserContext";
import Textarea from "../../../components/common/Textarea";
import userService from "../../../services/user.service";
import { ApiError } from "../../../api/api.client";

const ProfileInfoForm = () => {
  const { user, setUser } = useUserContext();

  const defaultValues = {
    'firstName': user.firstName || '',
    'lastName': user.lastName || '',
    'email': user.email || '',
    'phone': user.phone || '',
    'bio': user.bio || '',
  }

  const { register, handleSubmit, formState, setError } = useForm({
    defaultValues,
  });
  const { errors, isSubmitting } = formState;


  const onSubmit = async (values) => {
    try {
      const res = await userService.updateUser(values);
      if(res.success) {
        const user = await userService.getUser();
        console.log(user.data.user)
        if (user.success) {
          console.log('setting user')
          setUser(user.data.user);
        }
      }
    } catch(error) {
      if (error instanceof ApiError) {
        if (Array.isArray(error?.data?.errors)) {
          error.data.errors.forEach(error => {
            setError(error.field, {
              message: error.message
            })
          })
        }
      };
    }
  } 

  return(
      <Card>
        <h2 className="text-xl font-bold mb-6">Personal Information</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="First Name" 
              placeholder="John" 
              {
                ...register('firstName', {
                  required: "First Name is Required",
                  minLength: {
                    value: 3,
                    message: "First Name must be at least 3 letters",
                  },
                  maxLength: {
                    value: 20,
                    message: "First Name must be at most 20 letters",
                  },
                })
              }
              error={ errors.firstName ? errors.firstName.message : false }
              required
            />
            <Input 
              label="Last Name" 
              placeholder="Doe" 
              {
                ...register('lastName', {
                  minLength: {
                    value: 3,
                    message: "Last Name must be atleast 3 letters",
                  },
                  maxLength: {
                    value: 50,
                    message: "Last Name must be atmost 50 letters",
                  },
                })
              }
              error={ errors.lastName ? errors.lastName.message : false }
            />
          </div>
          <Input 
            label="Email" 
            type="email" 
            { 
              ...register('email', {
                required: "Email is Required!",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i,
                  message: 'Please enter a valid email address'
                },
              })
            }
            error={ errors.email ? errors.email.message : false }
            required
          />
          <Input 
            label="Phone" 
            type="tel" 
            { 
              ...register('phone', {
                required: "Phone number is Required!",
                pattern: {
                  value: /^(?:\+|00)?\d{10,15}$/,
                  message: 'Please enter a valid phone number'
                },
              })
            }
            error={ errors.phone ? errors.phone.message : false }
            required
          />
          <Textarea 
            label="Bio" 
            rows={4} 
            {
              ...register('bio', {
                minLength: {
                  value: 15,
                  message: "Bio must be atleast 15 characters",
                },
                maxLength: {
                  value: 250,
                  message: "Bio must be atleast 250 characters",
                }
              })
            }
            error={ errors.bio ? errors.bio.message : false }
          />
          <Button variant="primary">{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
        </form>
      </Card>
  )
}

export default ProfileInfoForm;
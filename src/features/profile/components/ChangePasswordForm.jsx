import { useForm } from "react-hook-form";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import Input from "../../../components/common/Input";
import userService from "../../../services/user.service";
import { ApiError } from "../../../api/api.client";
import useUserContext from "../../../hooks/useUserContext";

const ChangePasswordForm = () => {
  const { user, setUser } = useUserContext();
  const defaultValues = {
    'currentPassword': '',
    'newPassword': '',
    'confirmPassword': '',
  }
  const { register, handleSubmit, formState, setError, reset } = useForm({
    defaultValues,
  });
  const { errors, isSubmitting } = formState;

  async function onSubmit({ currentPassword, newPassword }) {
    try {
      let res;
      if (user.setPassword) {
        res = await userService.updatePassword({ currentPassword, newPassword });
      } else {
        res = await userService.createPassword({ newPassword });
        if (res.success) {
          const user = await userService.getUser();
          setUser(user.data.user);
        }
      }
      if (res.success) {
        reset();
      }
    } catch(error) {
      if (error instanceof ApiError) {
        setError('currentPassword', {
          message: error.data.message
        })
      };
    }
  }

  return(
      <Card>
        <h2 className="text-xl font-bold">{user.setPassword ? 'Change Password' : 'Create Password' } </h2>
        {
          !user.setPassword && 
          <h4 className="text-sm mt-1" >You signed in using Google. Please set a password to enable email login.</h4>
        }
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          {
            user.setPassword && 
            <Input 
              label="Current Password" 
              type="password" 
              {
                ...register('currentPassword', {
                  required: 'Current Password is required!',
                })
              }
              error={errors.currentPassword ? errors.currentPassword.message : false}
              required
            />
          }
          <Input 
            label={user.setPassword ? 'New Password' : 'Password' } 
            type="password" 
            {
              ...register('newPassword', {
                required: 'New Password is required!',
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
            error={errors.newPassword ? errors.newPassword.message : false}
            required
          />
          <Input 
            label="Confirm Password" 
            type="password" 
            {
              ...register('confirmPassword', 
                {
                  required: 'Confirm password is required!',
                  validate: (value, formValues) =>
                    value === formValues.newPassword || 'Passwords do not match'
                }
              )
            }
            error={errors.confirmPassword ? errors.confirmPassword.message : false}
            required
          />
          {
            user.setPassword ?
            <Button variant="primary">{ isSubmitting ? 'updating...' : 'Update' }</Button> :
            <Button variant="primary">{ isSubmitting ? 'Saving...' : 'Create' }</Button>
          }
        </form>
      </Card>
  )
}

export default ChangePasswordForm;
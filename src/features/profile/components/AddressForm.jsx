import { useForm } from "react-hook-form";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import Input from "../../../components/common/Input";
import useUserContext from "../../../hooks/useUserContext";
import userService from "../../../services/user.service";

const AddressForm = () => {
  const { user, setUser } = useUserContext();

  const address = user?.addresses?.[0] || null;

  const defaultValues = {
    'street': address?.street || '',
    'city': address?.city || '',
    'state': address?.state || '',
    'country': address?.country || '',
    'postalCode': address?.postalCode || '',
  }

  const { register, handleSubmit, formState } = useForm({
    defaultValues,
  });
  const { errors, isSubmitting } = formState;

  const onSubmit = async (values) => {
    const existingAddess = await userService.getAddress();
    
    if (!existingAddess.data) {
      const res = await userService.createAddress(values);
      if (res.success) {
        setUser(prevUser => ({ ...prevUser, addresses: [res.data.address] }));
      }
    } else {
      const res = await userService.updateAddress(values, existingAddess.data._id);
      if (res.success) {
        setUser(prevUser => ({ ...prevUser, addresses: [res.data.address] }));
      }
    }
  } 

  return(
      <Card>
        <h2 className="text-xl font-bold mb-6">Address</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Street" 
            {
              ...register('street', { required: "Street is Required" })
            }
            error={ errors.street ? errors.street.message : false }
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="City" 
              {
                ...register('city', { required: "City is Required" })
              }
              error={ errors.city ? errors.city.message : false }
              required
            />
            <Input 
              label="State" 
              {
                ...register('state', { required: "State is Required" })
              }
              error={ errors.state ? errors.state.message : false }
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Postal Code" 
              {
                ...register('postalCode', { required: "Postal Code is Required" })
              }
              error={ errors.postalCode ? errors.postalCode.message : false }
              required
            />
            <Input 
              label="Country"
              {
                ...register('country', { required: "Country is Required" })
              }
              error={ errors.country ? errors.country.message : false } 
              required
            />
          </div>
          <Button variant="primary">{ isSubmitting ? 'Saving...' : 'Save Address' }</Button>
        </form>
      </Card>
  )
}

export default AddressForm;
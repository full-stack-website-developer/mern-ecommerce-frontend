import { ApiError } from "../../../api/api.client";
import Card from "../../../components/common/Card";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import ImageUploadBox from "../../../components/common/ImageUploadBox";
import Button from "../../../components/common/Button";
import brandService from "../../../services/brand.service";
import { useBrandForm } from "../hooks/useBrandForm";

const BrandForm = ({ brand={}, id=null }) => {
  const { logoPreview, handleLogoChange, formMethods, navigate, validateLogo, prepareSubmissionData } = useBrandForm(brand);
  const { register, handleSubmit, formState: { setError, errors, isSubmitting } } = formMethods;
    
    async function onSubmit( values ) {
      if(!validateLogo()) return;
      const formData = prepareSubmissionData(values);
  
      try {
        let res;
        id ? 
        res = await brandService.update(formData, id) :
        res = await brandService.create(formData);
        
        if (res.success) {
          navigate('/admin/brands');
        }
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 409) {
            setError('name', {
              type: 'name',
              message: error.message
            });
          } else {
            setError('root', {
              type: 'server',
              message: error.message
            });
          }
        }
      }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="space-y-6">
            <h2 className="text-lg font-semibold">Brand details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Name"
                name="name"
                placeholder="e.g. Acme"
                {...register('name')}
                error = {errors.name ? errors.name.message : false} 
                // required
              />
              <Select
                label="Status"
                name="status"
                options={[
                  { value: '', label: 'Select an Option' },
                  { value: 'enabled', label: 'Enabled' },
                  { value: 'disabled', label: 'Disabled' },
                ]}
                {...register('status')}
                error = {errors.status ? errors.status.message : false}
              />
            </div>
            <ImageUploadBox
              label="Brand Logo"
              value={logoPreview}
              onChange={handleLogoChange}
              aspect={1}
              cropShape="rect"
              placeholder="Upload brand logo"
              helperText="PNG, JPG, SVG (max 5MB) • Recommended: 500x500px"
              error={errors.logo ? errors.logo.message : null}
              required
            />
            {errors.root && <p className="mt-1 text-sm text-red-500">{errors.root.message}</p>}
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="secondary" onClick={(e) => e.baack()}>Cancel</Button>
              <Button variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Brand' }</Button>
            </div>
          </Card>
        </form>
    )
}

export default BrandForm;
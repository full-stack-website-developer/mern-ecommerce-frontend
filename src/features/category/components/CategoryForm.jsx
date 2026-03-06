import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import categoryService from "../../../services/category.service";
import { ApiError } from "../../../api/api.client";
import Card from "../../../components/common/Card";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import ImageUploadBox from "../../../components/common/ImageUploadBox";
import Button from "../../../components/common/Button";

const CategoryForm = ({ category=null, id=null }) => {
const navigate = useNavigate();
    const [ categoriesLoading, setCategoriesLoading ] = useState(true);
    const [ parentOptions, setParentOptions ] = useState([]);
    const [ logoBlob, setLogoBlob ] = useState(null);
    const [ logoPreview, setLogoPreview ] = useState(category?.logo?.url || null);

    const { register, handleSubmit, formState: { errors, isSubmitting }, setError, clearErrors, setValue } = useForm({
      defaultValues: {
        'name': category?.name || '',
        'slug': category?.slug || '',
        'parentId': category?.parentId || '',
        'status': category?.status || '',

      }
    });

    useEffect(() => {
      if (categoriesLoading) return;
      const selectedParent = category?.parentId?._id || category?.parentId || '';
      setValue('parentId', selectedParent);
    }, [categoriesLoading, category?.parentId, setValue]);

    const handleLogoChange = (blob, previewUrl) => {
        setLogoBlob(blob);
        setLogoPreview(previewUrl);
        if (blob) {
          clearErrors('logo');
        }
    };

    async function onSubmit( values ) {
        if (!logoBlob && !category?.logo) {
          setError('logo', {
              message: 'Logo is Required' 
          })
          return;
        }
        const formData = new FormData();

        if (logoBlob) {
          formData.append('logo', logoBlob, 'logo.jpg');
        }
        
        formData.append('values', JSON.stringify(values));

        try {
          let res;
          id ? 
          res = await categoryService.update(formData, id) :
          res = await categoryService.create(formData);
            
          if (res.success) {
              navigate('/admin/categories');
          }
        } catch (error) {
          if (error instanceof ApiError) {
              if (error.status === 400 && error.data?.errors) {
              Object.entries(error.data.errors).forEach(([field, message]) => {
                  setError(field, { type: 'server', message });
              });
              return;
              } else {
              setError('root', {
                  type: 'server',
                  message: error.message
              });
              }
          }
        }
    };

    useEffect(() => {
        setCategoriesLoading(true);
        const getCategories = async() => {
        try {
            const res = await categoryService.categories('parent');
            if (res.success) {
              const options = (res.data || []).filter((item) => String(item._id) !== String(id || ''));
              setParentOptions(options);
            }
        } catch(error) {
            setError('parentId', {
            type: 'server',
            message: error.message,
            })
        } finally {
            setCategoriesLoading(false)
        }
        }
        getCategories();
    }, [id, setError]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="space-y-6">
            <h2 className="text-lg font-semibold">Category details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Name"
                name="name"
                placeholder="e.g. Electronics"
                {
                  ...register('name', {
                    required: "Name is Required",
                    minLength: {
                      value: 3,
                      message: "Name must be at least 3 letters",
                    },
                    maxLength: {
                      value: 20,
                      message: "Name must be at most 20 letters",
                    },
                  })
                }
                error = {errors.name ? errors.name.message : false} 
                // required
              />
              <Input
                label="Slug"
                name="slug"
                placeholder="electronics (lowercase, unique)"
                {
                  ...register('slug', {
                    required: 'Slug is required',
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        'Slug must be lowercase letters, numbers, and single hyphens only (e.g. apple-watch)',
                    },
                    minLength: {
                      value: 3,
                      message: 'Slug must be at least 3 characters',
                    },
                    maxLength: {
                      value: 50,
                      message: 'Slug must be at most 50 characters',
                    },
                  })
                }
                error = {errors.slug ? errors.slug.message : false} 
                // required
              />
              <Select
                label="Parent Category"
                placeholder='None (Top-level parent category)'
                allowEmpty
                options={parentOptions}
                {
                  ...register('parentId')
                }
                loading={categoriesLoading}
                error = {errors.parentId ? errors.parentId.message : false} 
              />
              <Select
                label="Status"
                name="status"
                options={[
                  { value: 'enabled', label: 'Enabled' },
                  { value: 'disabled', label: 'Disabled' },
                ]}
                {
                  ...register('status', {
                    required: 'Status is required',
                  })
                }
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
              <Button type="button" variant="secondary" onClick={() => navigate('/admin/categories')}>Cancel</Button>
              <Button variant="primary" disabled={isSubmitting}>{ isSubmitting ? 'Saving...' : 'Save Category' }</Button>
            </div>
          </Card>
        </form>
    )
}

export default CategoryForm;

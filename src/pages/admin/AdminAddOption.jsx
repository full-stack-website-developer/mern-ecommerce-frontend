import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import optionService from '../../services/option.service';
import OptionForm from '../../features/option/components/OptionForm';

const AdminAddOption = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const isEditMode = Boolean(id);

  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors, isSubmitting },
    watch 
  } = useForm({
    defaultValues: {
      name: isEditMode ? 'Color' : '',
      displayType: 'dropdown',
      status: 'enabled',
      variants: isEditMode 
        ? [
            { value: 'Red', metadata: '#EF4444', enabled: true },
            { value: 'Blue', metadata: '#3B82F6', enabled: true },
          ]
        : [{ value: '', metadata: '', enabled: true }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  const displayType = watch('displayType');

  const onSubmit = async (data) => {
    try {
      console.log('Submitting Option Group:', data);
      
      // Filter out empty variants
      const validVariants = data.variants.filter(v => v.value.trim() !== '');
      
      if (validVariants.length === 0) {
        alert('Please add at least one variant value');
        return;
      }

      const payload = {
        ...data,
        variants: validVariants,
      };

      // // API call here
      let res;
      if (isEditMode) {
        res = await updateOptionGroup(id, payload);
      } else {
        res = await optionService.create(payload);
      }
      
      if (res.success) {
        navigate('/admin/options');
      }
      // Success notification and redirect
    } catch (error) {
      console.error('Error saving option group:', error);
    }
  };

  const addVariant = () => {
    append({ value: '', metadata: '', enabled: true });
  };

  const getMetadataPlaceholder = () => {
    switch (displayType) {
      case 'color-swatch':
        return '#000000';
      case 'image':
        return 'https://example.com/image.jpg';
      default:
        return 'Optional metadata';
    }
  };

  const getMetadataLabel = () => {
    switch (displayType) {
      case 'color-swatch':
        return 'Hex Color';
      case 'image':
        return 'Image URL';
      default:
        return 'Metadata';
    }
  };
console.log(errors);
  return (
    <AdminLayout>
      <OptionForm />
    </AdminLayout>
  );
};

export default AdminAddOption;
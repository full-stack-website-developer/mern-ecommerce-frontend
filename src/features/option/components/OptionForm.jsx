import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import optionService from "../../../services/option.service";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import { Plus, Trash2 } from "lucide-react";

const OptionForm = ({ option=null, id=null }) => {
    const navigate = useNavigate();

    const { 
        register, 
        handleSubmit, 
        control,
        formState: { errors, isSubmitting },
        // watch 
    } = useForm({
        defaultValues: {
          name: option?.name || '',
          // displayType: option?.displayType || '',
          status: option?.status || '',
          values: option?.values || [{ label: '', enabled: true }],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'values',
    });

    // const displayType = watch('displayType');

    const onSubmit = async (data) => {
        try {
        
        // Filter out empty values
        const validValues = data.values.filter(v => v.label.trim() !== '');
        
        if (validValues.length === 0) {
            alert('Please add at least one variant value');
            return;
        }

        const payload = {
            ...data,
            values: validValues,
        };


        let res;
        id ?
        res = await optionService.update(payload, id) :
        res = await optionService.create(payload);
        
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

    // const getMetadataPlaceholder = () => {
    //     switch (displayType) {
    //     case 'color-swatch':
    //         return '#000000';
    //     case 'image':
    //         return 'https://example.com/image.jpg';
    //     default:
    //         return 'Optional metadata';
    //     }
    // };

    // const getMetadataLabel = () => {
    //     switch (displayType) {
    //     case 'color-swatch':
    //         return 'Hex Color';
    //     case 'image':
    //         return 'Image URL';
    //     default:
    //         return 'Metadata';
    //     }
    // };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {id ? 'Edit' : 'Add'} Option Group
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Create reusable option groups like Color, Size, Material with their values
            </p>
          </div>
          <Button 
            type="button" 
            variant="secondary"
            onClick={() => navigate('/admin/option-groups')}
          >
            Cancel
          </Button>
        </div>

        {/* Option Group Details */}
        <Card className="space-y-6">
          <h2 className="text-lg font-semibold">Option Group Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Group Name */}
            <Input
              label="Option Group Name"
              name="name"
              placeholder="e.g. Color, Size, Material"
              {...register('name', {
                required: 'Option group name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
                maxLength: {
                  value: 50,
                  message: 'Name must not exceed 50 characters',
                },
              })}
              error={errors.name ? errors.name.message : false}
              required
            />

            {/* Display Type
            <Select
              label="Display Type"
              name="displayType"
              options={[
                { value: 'dropdown', label: 'Dropdown' },
                { value: 'button', label: 'Button' },
                { value: 'color-swatch', label: 'Color Swatch' },
                { value: 'image', label: 'Image' },
              ]}
              {...register('displayType', {
                required: 'Display type is required',
              })}
              error={errors.displayType ? errors.displayType.message : false}
              required
            /> */}

            {/* Status */}
            <Select
              label="Status"
              name="status"
              options={[
                { value: 'enabled', label: 'Enabled' },
                { value: 'disabled', label: 'Disabled' },
              ]}
              {...register('status', {
                required: 'Status is required',
              })}
              error={errors.status ? errors.status.message : false}
              required
            />
          </div>

          {/* Display Type Info */}
          {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Display Type:</strong> {' '}
              {displayType === 'color-swatch' && 'Shows color circles with hex values'}
              {displayType === 'button' && 'Shows clickable button options'}
              {displayType === 'dropdown' && 'Shows traditional dropdown select'}
              {displayType === 'image' && 'Shows image thumbnails for each option'}
            </p>
          </div> */}
        </Card>

        {/* Variants Table */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Variant Values</h2>
              <p className="text-sm text-gray-600 mt-1">
                Add specific values for this option group (e.g., Red, Blue, Green for Color)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addVariant}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Value
            </Button>
          </div>

          {/* Variants Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Value Name *
                  </th>
                  {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    quantity *
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    price *
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {getMetadataLabel()}
                  </th> */}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {fields.map((field, index) => (
                  <tr key={field.id} className="hover:bg-gray-50">
                    {/* Value Name */}
                    <td className="px-4 py-3">
                      {/* <input
                        type="text"
                        {...register(`variants.${index}.value`, {
                          required: 'Value is required',
                          minLength: {
                            value: 1,
                            message: 'Value must not be empty',
                          },
                        })}
                        placeholder="e.g. Red, Small, Cotton"
                        className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                          errors.variants?.[index]?.value
                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                        }`}
                      /> */}
                      {/* {errors.variants?.[index]?.value && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.variants[index].value.message}
                        </p>
                      )} */}
                      <Input 
                        type="text"
                        placeholder="e.g. Red, Small, Cotton"
                        {...register(`values.${index}.label`, {
                          required: 'label is required',
                          minLength: {
                            value: 1,
                            message: 'label must not be empty',
                          },
                        })}
                        error = {errors.values?.[index]?.label ? errors.values?.[index]?.label.message : false}
                      />
                    </td>

                    {/* <td>
                      <Input 
                        type='number'
                        placeholder={0}
                        {
                          ...register(`variants.${index}.quantity`, {
                            required: 'Quantity is required',
                            min: {
                              value: 1,
                              message: 'Quantity must be at least 1',
                            },
                          }
                        )}
                        error = {errors.variants?.[index]?.quantity ? errors.variants?.[index]?.quantity.message : false}
                      />
                    </td>

                    <td>
                      <Input 
                        type='number'
                        placeholder={0}
                        {
                          ...register(`variants.${index}.price`, {
                            required: 'Price is required',
                            min: {
                              value: 1,
                              message: 'Price must be at least 1',
                            },
                          }
                        )}
                        error = {errors.variants?.[index]?.price ? errors.variants?.[index]?.price.message : false}
                      />
                    </td> */}

                    {/* Metadata */}
                    {/* <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {displayType === 'color-swatch' && (
                          <input
                            type="color"
                            {...register(`variants.${index}.metadata`)}
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                        )}
                        <input
                          type="text"
                          {...register(`variants.${index}.metadata`)}
                          placeholder={getMetadataPlaceholder()}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </td> */}

                    {/* Status */}
                    <td className="px-4 py-3">
                      <select
                        {...register(`values.${index}.enabled`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value={true}>Enabled</option>
                        <option value={false}>Disabled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {fields.length === 0 && (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 mb-3">No variant values added yet</p>
              <Button type="button" variant="primary" size="sm" onClick={addVariant}>
                <Plus className="w-4 h-4 mr-1" />
                Add First Value
              </Button>
            </div>
          )}

          {/* Help Text */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              💡 <strong>Tip:</strong> Add all possible values for this option group. 
              You can disable individual values without deleting them. 
              At least one value is required.
            </p>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card className="flex flex-wrap gap-3 justify-end">
          <Button 
            type="button" 
            variant="secondary"
            onClick={() => {
              const confirmed = window.confirm("Changes will be discarded. Continue?");
              if (confirmed) {
                navigate("/admin/options");
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? 'Saving...' 
              : id 
                ? 'Update Option Group' 
                : 'Create Option Group'
            }
          </Button>
        </Card>
      </form>
    )
}

export default OptionForm;
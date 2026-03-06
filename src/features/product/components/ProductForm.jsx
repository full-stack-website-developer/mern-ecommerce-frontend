import { Controller } from "react-hook-form";
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Textarea from '../../../components/common/Textarea';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import Checkbox from "../../../components/common/Checkbox";
import GroupedSelect from "../../../components/common/GroupedSelect";
import MediaUploadCard from "./MediaUploadCard";
import OptionGroupSelector from "../../../pages/admin/OptionGroupSelector";
import CreatableSelect from "react-select/creatable";
import { useProductForm } from "../hooks/useProductForm";
import { useProductMutation } from "../hooks/useProductMutation";
import { useCategories } from "../hooks/useCategories";
import { useOptions } from "../hooks/useOptions";
import { useBrands } from "../../common/hooks/useBrands";
import Table from "../../../components/common/Table";
import productService from "../../../services/product.service";

const ProductForm = ({
  product,
  id = null,
  mode = 'admin',
  successPath = '/admin/products',
  cancelPath = '/admin/products',
  onSuccess = null,
}) => {
  const { brands, loading: brandsLoading }         = useBrands();
  const { categories, loading: categoriesLoading } = useCategories('child');
  const { options, loading: optionsLoading }       = useOptions();

  const {
    formMethods,
    mainImageData,
    additionalImagesData,
    selectedOptions,
    handleMainImageChange,
    handleAdditionalImagesChange,
    handleOptionChange,
    handleRemoveExistingAdditionalImage,
    prepareSubmissionData,
    navigate,
    variantFields,
  } = useProductForm(product);

  const { createProduct, updateProduct, updateSellerProduct, isLoading: isMutating } = useProductMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    control,
    watch,
  } = formMethods;

  const hasVariants = variantFields.length > 0;
  const flashSaleEnabled = watch('flashSaleIsActive');

  const valueLabelMap = buildValueLabelMap(options);

  const onSubmit = async (values) => {
    const formData = prepareSubmissionData(values);

    const result = id
      ? (mode === 'seller'
          ? await updateSellerProduct(formData, id)
          : await updateProduct(formData, id))
      : await createProduct(formData);

    if (result.success) {
      if (mode === 'admin') {
        const savedProductId = id || result.data?.product?._id || result.data?._id;

        if (savedProductId) {
          const payload = {
            isActive: Boolean(values.flashSaleIsActive),
            salePrice: values.flashSaleIsActive ? Number(values.flashSaleSalePrice) : null,
            startAt: values.flashSaleIsActive && values.flashSaleStartAt
              ? new Date(values.flashSaleStartAt).toISOString()
              : null,
            endAt: values.flashSaleIsActive && values.flashSaleEndAt
              ? new Date(values.flashSaleEndAt).toISOString()
              : null,
          };

          try {
            await productService.setFlashSale(savedProductId, payload);
          } catch (error) {
            setError('root', {
              type: 'server',
              message: error?.message || 'Product saved, but flash sale update failed',
            });
            return;
          }
        }
      }

      if (typeof onSuccess === 'function') {
        onSuccess();
      }
      navigate(successPath);
    } else if (result.error?.type === 'validation') {
      Object.entries(result.error.errors).forEach(([field, message]) => {
        setError(field, { type: 'server', message });
      });
    } else {
      setError('root', {
        type: 'server',
        message: result.error?.message || 'An error occurred',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Basic Information */}
      <Card className="space-y-6">
        <h2 className="text-lg font-semibold">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Input
            label="Product Name"
            placeholder="e.g. Wireless Headphones"
            {...register('name')}
            error={errors.name?.message}
          />

          <Input
            label="SKU"
            placeholder="e.g. WH-1234 (uppercase, unique)"
            {...register('sku')}
            error={errors.sku?.message}
          />

          {!hasVariants && (
            <>
              <Input
                label="Price"
                type="number"
                placeholder="0"
                {...register('price')}
                error={errors.price?.message}
              />
              <Input
                label="Quantity"
                type="number"
                placeholder="0"
                {...register('quantity')}
                error={errors.quantity?.message}
              />
            </>
          )}

          {hasVariants && (
            <div className="md:col-span-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              Price and quantity are set per variant in the table below.
            </div>
          )}

          <Input
            label="Discount (%)"
            type="number"
            placeholder="0–100"
            {...register('discount')}
            error={errors.discount?.message}
          />

          <GroupedSelect
            label="Category"
            options={categories}
            {...register('categoryId')}
            loading={categoriesLoading}
            error={errors.categoryId?.message}
          />

          <Select
            label="Brand"
            options={brands}
            {...register('brand')}
            loading={brandsLoading}
            error={errors.brand?.message}
          />

          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <CreatableSelect
                  {...field}
                  isMulti
                  value={field.value?.map(tag => ({ value: tag, label: tag }))}
                  onChange={(selected) => field.onChange(selected?.map(s => s.value) || [])}
                />
              </div>
            )}
          />

          <Select
            label="Status"
            options={[
              { value: 'enabled',  label: 'Enabled'  },
              { value: 'disabled', label: 'Disabled' },
            ]}
            {...register('status')}
            error={errors.status?.message}
          />

        </div>
      </Card>

      {/* Descriptions */}
      <Card className="space-y-6">
        <h2 className="text-lg font-semibold">Descriptions</h2>
        <div className="space-y-4">
          <Textarea
            label="Short Description"
            placeholder="Required."
            rows={3}
            {...register('shortDescription')}
            error={errors.shortDescription?.message}
          />
          <Textarea
            label="Long Description"
            placeholder="Optional."
            rows={6}
            {...register('longDescription')}
            error={errors.longDescription?.message}
          />
        </div>
      </Card>

      {mode === 'admin' && (
        <Card className="space-y-6">
          <h2 className="text-lg font-semibold">Flash Sale</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Checkbox
                label="Enable flash sale for this product"
                {...register('flashSaleIsActive')}
              />
            </div>

            <Input
              label="Sale Price"
              type="number"
              placeholder="0.00"
              disabled={!flashSaleEnabled}
              {...register('flashSaleSalePrice')}
              error={errors.flashSaleSalePrice?.message}
            />

            <div></div>

            <Input
              label="Start At"
              type="datetime-local"
              disabled={!flashSaleEnabled}
              {...register('flashSaleStartAt')}
              error={errors.flashSaleStartAt?.message}
            />

            <Input
              label="End At"
              type="datetime-local"
              disabled={!flashSaleEnabled}
              {...register('flashSaleEndAt')}
              error={errors.flashSaleEndAt?.message}
            />
          </div>
        </Card>
      )}

      {/* Media */}
      <MediaUploadCard
        initialMainImage={mainImageData}
        initialAdditionalImages={additionalImagesData}
        onMainImageChange={handleMainImageChange}
        onAdditionalImagesChange={handleAdditionalImagesChange}
        handleRemoveExistingAdditionalImage={handleRemoveExistingAdditionalImage}
        register={register}
        errors={errors}
        required={true}
      />

      {/* Product Options & Variants */}
      <Card className="space-y-6">
        <h2 className="text-lg font-semibold">Product Options & Variants</h2>
        <p className="text-sm text-gray-600">
          Select option values to define variants. The table updates automatically.
          Leave empty for a simple product.
        </p>

        <OptionGroupSelector
          optionGroups={options}
          value={selectedOptions}
          onChange={handleOptionChange}
          error={null}
          loading={optionsLoading}
        />

        {variantFields.length > 0 && (
          <>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              {variantFields.length} variant{variantFields.length > 1 ? 's' : ''} generated automatically.
              Fill in SKU, price, and quantity for each.
            </div>

            <div className="max-h-64 overflow-y-auto border rounded">
              <Table
                headers={['Variant', 'SKU', 'Price', 'Quantity']}
                className="min-w-full border-collapse"
              >
                {variantFields.map((field, index) => {
                  // Derive label from the field's options array + valueLabelMap.
                  // field.label is '' when loaded from DB (set in getDefaultValues),
                  // and a proper string when generated by the useEffect.
                  // This ensures the label always displays correctly in both cases.
                  const displayLabel = field.label ||
                    (field.options || [])
                      .map(o => valueLabelMap[o.valueId] || o.valueId)
                      .join(' / ');

                  return (
                    <tr key={field.id}>

                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 min-w-[120px]">
                        {displayLabel}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <Input
                          placeholder="e.g. PROD-RED-S"
                          {...register(`variants.${index}.sku`)}
                          error={errors.variants?.[index]?.sku?.message}
                        />
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...register(`variants.${index}.price`)}
                          error={errors.variants?.[index]?.price?.message}
                        />
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <Input
                          type="number"
                          placeholder="0"
                          {...register(`variants.${index}.quantity`)}
                          error={errors.variants?.[index]?.quantity?.message}
                        />
                      </td>

                    </tr>
                  );
                })}
              </Table>
            </div>
          </>
        )}
      </Card>

      {errors.root && (
        <p className="mt-1 text-sm text-red-500">{errors.root.message}</p>
      )}

      <Card className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate(cancelPath)}
        >
          Cancel
        </Button>
        <Button variant="primary" disabled={isMutating}>
          {isMutating
            ? (id ? 'Updating...' : 'Saving...')
            : (id ? 'Update Product' : 'Create Product')
          }
        </Button>
      </Card>

    </form>
  );
};

// Build a flat map of valueId → label from the full options list
// e.g. { "699af...": "red", "699af...": "small", ... }
function buildValueLabelMap(optionGroups = []) {
  const map = {};
  optionGroups.forEach(group => {
    group.values?.forEach(v => {
      map[v._id.toString()] = v.label;
    });
  });
  return map;
}

export default ProductForm;

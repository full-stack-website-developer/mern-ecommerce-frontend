/**
 * Prepare FormData for product submission
 */
export const prepareFormData = ({
  mainImageData,
  additionalImagesData,
  existingAdditionalImages,
  selectedOptions,
  ...formValues
}) => {
  const formData = new FormData();

  const variants = formValues.variants;
  const hasVariants = Array.isArray(variants) && variants.length > 0;

  formData.append('hasVariants', JSON.stringify(hasVariants));

  formData.append('existingAdditionalImages', JSON.stringify(existingAdditionalImages));

  if (mainImageData?.file) {
    formData.append('mainImage', mainImageData.file);
  }

  if (Array.isArray(additionalImagesData)) {
    additionalImagesData.forEach(img => {
      if (img?.file) {
        formData.append('additionalImages', img.file);
      }
    });
  }

  Object.entries(formValues).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  });

  formData.append('selectedOptions', JSON.stringify(selectedOptions || []));

  return formData;
};

/**
 * Log FormData for debugging
 */
export const logFormData = (formData) => {
  formData.forEach((value, key) => {
    console.log(`${key}:`, value);
  });
};
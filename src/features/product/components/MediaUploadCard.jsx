import React, { useEffect, useState } from 'react';
import Card from '../../../components/common/Card';
import MultiImageUploadZone from '../../../components/common/MultiImageUploadZone';
import ImageUploadZone from '../../../components/common/ImageUploadZone';

/**
 * Media upload card component using reusable common components
 * @param {Object} props
 * @param {Function} props.onMainImageChange - Callback when main image changes
 * @param {Function} props.onAdditionalImagesChange - Callback when additional images change
 */
const MediaUploadCard = ({ 
  initialMainImage,
  initialAdditionalImages,
  onMainImageChange, 
  onAdditionalImagesChange,  
  register,
  errors = {},
  required = true  ,
  handleRemoveExistingAdditionalImage,
}) => {
  const [mainImage, setMainImage] = useState(initialMainImage || null);
  const [additionalImages, setAdditionalImages] = useState(initialAdditionalImages || []);

  // Handle main image change
  const handleMainImageChange = (imageData) => {
    setMainImage(imageData);
    onMainImageChange?.(imageData);
  };

  // Handle main image remove
  const handleMainImageRemove = () => {
    setMainImage(null);
    onMainImageChange?.(null);
  };

  // Handle additional images change
  const handleAdditionalImagesChange = (imagesData) => {
    setAdditionalImages(imagesData);
    onAdditionalImagesChange?.(imagesData);
  };

  // Handle remove single additional image
  const handleRemoveAdditionalImage = (index, url) => {
    const updated = additionalImages.filter((_, i) => i !== index);
    setAdditionalImages(updated);
    onAdditionalImagesChange?.(updated);
    handleRemoveExistingAdditionalImage(url)
  };

  useEffect(() => {
    if (register) {
      register('mainImage', {
        validate: (value) => {
          if (required && !mainImage) {
            return 'Main image is required';
          }
          return true;
        }
      });
    }
  }, [register, mainImage, required]);

  return (
    <Card className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Media</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Image Upload */}
        <div>
          <ImageUploadZone
            image={mainImage}
            onImageChange={handleMainImageChange}
            onImageRemove={handleMainImageRemove}
            label={
                <span>
                  Main Image
                  {required && <span className="text-red-500 ml-1">*</span>}
                </span>
            }
            placeholder="Drop your image here, or browse"
            defaultText="Default: no-image.jpg"
            showPreview={true}
          />
          {errors.mainImage && (
            <p className="mt-2 text-sm text-red-600">
              {errors.mainImage.message}
            </p>
          )}
        </div>

        {/* Additional Images Upload */}
        <div>
          <MultiImageUploadZone
            images={additionalImages}
            onImagesChange={handleAdditionalImagesChange}
            onImageRemove={handleRemoveAdditionalImage}
            maxImages={20}
            label="Additional Images"
            placeholder="Drop multiple images here"
            gridCols={3}
            errors={errors}
          />
          {errors.additionalImages && (
            <p className="mt-2 text-sm text-red-600">
              {errors.additionalImages.message}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MediaUploadCard;
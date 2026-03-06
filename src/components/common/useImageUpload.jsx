import { useState } from 'react';

/**
 * Reusable hook for image upload with cropping
 * Handles file selection, cropping, and upload
 * 
 * @param {Function} uploadFunction - API function to upload image: (formData) => Promise
 * @param {string} fieldName - Form field name (default: 'image')
 * @returns {Object} - { imageSrc, setImageSrc, handleFileSelect, handleCropComplete, uploading }
 */
const useImageUpload = (uploadFunction, fieldName = 'image') => {
  const [imageSrc, setImageSrc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  /**
   * Handle file selection from input
   */
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error('Please select an image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        console.error('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handle file selection from drag & drop
   */
  const handleFileDrop = (file) => {
    if (!file.type.startsWith('image/')) {
      console.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      console.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handle completion of cropping and upload
   */
  const handleCropComplete = async (croppedBlob, croppedImageUrl) => {
    try {
      setUploading(true);

      // Create FormData
      const formData = new FormData();
      formData.append(fieldName, croppedBlob, `${fieldName}.jpg`);

      // Call the upload function
      const response = await uploadFunction(formData);

      // Store the uploaded image URL
      if (response.success) {
        setUploadedImageUrl(response.data.url || response.data.image?.url);
        setImageSrc(null); // Close cropper
        return response;
      }

      throw new Error(response.message || 'Upload failed');
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Reset states
   */
  const reset = () => {
    setImageSrc(null);
    setUploading(false);
    setUploadedImageUrl(null);
  };

  return {
    imageSrc,
    setImageSrc,
    handleFileSelect,
    handleFileDrop,
    handleCropComplete,
    uploading,
    uploadedImageUrl,
    reset,
  };
};

export default useImageUpload;
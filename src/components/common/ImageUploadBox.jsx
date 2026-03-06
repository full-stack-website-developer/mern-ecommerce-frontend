import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import ImageCropperModal from './ImageCropperModal';

/**
 * Reusable Image Upload Box Component
 * Supports drag & drop, click to upload, preview, and cropping
 * 
 * @param {Object} props
 * @param {string} props.label - Label text (e.g., "Logo", "Banner")
 * @param {string} props.value - Current image URL
 * @param {Function} props.onChange - Callback with cropped blob and URL: (blob, url) => void
 * @param {number} props.aspect - Crop aspect ratio (default: 1 for square)
 * @param {string} props.cropShape - 'rect' or 'round' (default: 'rect')
 * @param {string} props.accept - Accepted file types (default: 'image/*')
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.helperText - Helper text below box
 * @param {boolean} props.required - Required field
 * @param {string} props.error - Error message
 * @param {number} props.maxSizeMB - Max file size in MB (default: 5)
 * @param {string} props.className - Additional CSS classes
 */
const ImageUploadBox = ({
  label = 'Image',
  value = null,
  onChange,
  aspect = 1,
  cropShape = 'rect',
  accept = 'image/*',
  placeholder = 'Drag & drop or click to upload',
  helperText = 'PNG, JPG, WebP (max 5MB)',
  required = false,
  error = null,
  maxSizeMB = 5,
  className = '',
}) => {
  const [previewUrl, setPreviewUrl] = useState(value);
  const [imageSrcToCrop, setImageSrcToCrop] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      alert(`Image size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Read file and show cropper
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrcToCrop(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  // Handle drag & drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Handle crop completion
  const handleCropComplete = (croppedBlob, croppedImageUrl) => {
    setPreviewUrl(croppedImageUrl);
    setImageSrcToCrop(null);
    
    // Call parent's onChange with blob and preview URL
    onChange?.(croppedBlob, croppedImageUrl);
  };

  // Remove image
  const handleRemove = (e) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onChange?.(null, null);
  };

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Upload Box */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('image-upload-input')?.click()}
        className={`
          relative border-2 w-[17%] border-dashed rounded-lg transition-all cursor-pointer
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400 bg-white'
          }
        `}
      >
        {/* Preview or Upload UI */}
        {previewUrl ? (
          // Image Preview
          <div className="relative group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-contain rounded-lg"
            />
            
            {/* Change Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 
                          rounded-lg transition-all flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm">
                Click to change
              </div>
            </div>
          </div>
        ) : (
          // Upload UI
          <div className="p-8 text-center">
            <div className="flex justify-center mb-3">
              <div className={`p-3 rounded-full ${
                isDragging ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {isDragging ? (
                  <Upload className={`w-8 h-8 text-blue-600`} />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 font-medium mb-1">
              {placeholder}
            </p>
            
            {helperText && (
              <p className="text-xs text-gray-400">
                {helperText}
              </p>
            )}
          </div>
        )}

        {/* Hidden File Input */}
        <input
          id="image-upload-input"
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Image Cropper Modal */}
      <ImageCropperModal
        imageSrc={imageSrcToCrop}
        isOpen={!!imageSrcToCrop}
        onComplete={handleCropComplete}
        onCancel={() => setImageSrcToCrop(null)}
        cropShape={cropShape}
        aspect={aspect}
        title={`Crop ${label}`}
      />
    </div>
  );
};

export default ImageUploadBox;
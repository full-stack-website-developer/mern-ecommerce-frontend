import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X } from 'lucide-react';

/**
 * Reusable Image Cropper Modal Component
 * 
 * @param {Object} props
 * @param {string} props.imageSrc - Base64 or URL of image to crop
 * @param {Function} props.onComplete - Callback with cropped blob: (blob, croppedImageUrl) => void
 * @param {Function} props.onCancel - Callback when cancelled
 * @param {number} props.aspect - Aspect ratio (default: 1 for square)
 * @param {string} props.cropShape - 'rect' or 'round' (default: 'round')
 * @param {string} props.title - Modal title
 * @param {boolean} props.isOpen - Control modal visibility
 */
const ImageCropperModal = ({
  imageSrc,
  onComplete,
  onCancel,
  aspect = 1,
  cropShape = 'round',
  title = 'Adjust Your Photo',
  isOpen = true,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        // Also create a preview URL
        const croppedImageUrl = URL.createObjectURL(blob);
        resolve({ blob, croppedImageUrl });
      }, 'image/jpeg', 0.95);
    });
  };

  const handleComplete = async () => {
    try {
      setProcessing(true);
      const { blob, croppedImageUrl } = await getCroppedImg(imageSrc, croppedAreaPixels);
      onComplete(blob, croppedImageUrl);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onCancel}
            disabled={processing}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="p-6">
          <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={cropShape}
              showGrid={cropShape === 'rect'}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Zoom Control */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Zoom</label>
              <span className="text-xs text-gray-500">{zoom.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            disabled={processing}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={processing}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {processing ? 'Processing...' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
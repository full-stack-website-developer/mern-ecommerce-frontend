import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Camera } from "lucide-react";
import Card from "../../../components/common/Card";
import useUserContext from "../../../hooks/useUserContext";
import userService from "../../../services/user.service";

const ProfilePicture = () => {
  const { user, setUser } = useUserContext();
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

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
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      const formData = new FormData();
      formData.append("avatar", croppedBlob, "avatar.jpg");

      const res = await userService.uploadAvatar(formData);
      if (res.success) {
        setUser((prevUser) => ({ ...prevUser, avatar: res.data.user.avatar }));
        setImageSrc(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center space-x-6">
        {/* Avatar with Hover */}
        <div className="relative group">
          <img
            className="w-24 h-24 rounded-full object-cover ring-2 ring-gray-200"
            src={user.avatar.url}
            alt={user.fullName}
          />
          
          <label
            htmlFor="avatar-upload"
            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 
                       rounded-full flex items-center justify-center cursor-pointer
                       transition-all duration-300"
          >
            <Camera
              className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
              size={32}
            />
          </label>
          
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        <div>
          <h2 className="text-xl font-bold">{user.fullName}</h2>
          <p className="text-sm text-gray-500 mt-1">Click avatar to change</p>
        </div>
      </div>

      {/* Crop Modal */}
      {imageSrc && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Adjust Your Photo</h3>
            
            <div className="relative h-96 bg-gray-100 rounded-lg">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="mt-4">
              <label className="text-sm text-gray-600">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setImageSrc(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                           disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProfilePicture;
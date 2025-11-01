
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { CameraIcon } from './icons/CameraIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface ImageUploaderProps {
  image: string | null;
  onImageChange: (imageBase64: string | null) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ image, onImageChange, isLoading }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setIsCameraOpen(true);
        setCameraError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError("Could not access camera. Please check permissions and try again.");
        setIsCameraOpen(false);
      }
    } else {
      setCameraError("Camera not supported on this browser.");
    }
  };

  const closeCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onImageChange(dataUrl);
        closeCamera();
      }
    }
  };
  
  useEffect(() => {
      return () => {
          closeCamera();
      }
  }, [closeCamera]);


  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-300 mb-4 text-center">
        Add an Image (Optional)
      </h2>
      <div className="flex flex-col items-center gap-4">
        {image ? (
          <div className="relative group w-full max-w-sm">
            <img src={image} alt="Problem preview" className="rounded-lg w-full h-auto object-contain max-h-60 border-2 border-gray-600" />
            <button
              onClick={() => onImageChange(null)}
              disabled={isLoading}
              className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 text-gray-300 hover:text-white hover:bg-red-600 transition-all duration-200 opacity-50 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Remove image"
            >
              <XCircleIcon className="w-7 h-7" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              id="image-upload"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-gray-200 rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UploadIcon className="w-5 h-5" />
              Upload Image
            </button>
            <button
              onClick={openCamera}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-gray-200 rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CameraIcon className="w-5 h-5" />
              Take Photo
            </button>
          </div>
        )}
        {cameraError && <p className="text-red-400 text-sm mt-2">{cameraError}</p>}
      </div>

      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-gray-800 rounded-lg shadow-xl p-4 w-full max-w-2xl">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-md mb-4 aspect-video bg-black"></video>
            <div className="flex justify-center gap-4">
              <button
                onClick={capturePhoto}
                className="px-6 py-3 bg-brand-green text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
              >
                Capture
              </button>
              <button
                onClick={closeCamera}
                className="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
       <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};
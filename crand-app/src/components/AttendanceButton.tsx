"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaceRecognitionService } from "@/services/faceRecognition";
import Image from "next/image";

interface AttendanceButtonProps {
  onSuccess?: (name: string, timestamp: string) => void;
  onError?: (message: string) => void;
  type?: "teacher" | "admin";
  isModalOpen?: boolean;
}

export default function AttendanceButton({
  onSuccess,
  onError,
  type = "teacher",
  isModalOpen = true,
}: AttendanceButtonProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [isNewFace, setIsNewFace] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [recognizedName, setRecognizedName] = useState("");
  const [attendanceTime, setAttendanceTime] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const faceService = FaceRecognitionService.getInstance();

  useEffect(() => {
    if (!isModalOpen) {
      stopCamera();
      setIsCameraActive(false);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isCameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setMessage("Tidak dapat mengakses kamera");
      setIsSuccess(false);
      if (onError) onError("Tidak dapat mengakses kamera");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
            setSelectedFile(file);
          }
        }, "image/jpeg");
      }
    }
  };

  const getUserLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      } else {
        reject(new Error("Geolocation tidak didukung oleh browser ini."));
      }
    });
  };

  const isWithinRadius = (
    userLat: number,
    userLng: number,
    pesantrenLat: number,
    pesantrenLng: number,
    radius: number
  ): boolean => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371e3;
    const φ1 = toRad(userLat);
    const φ2 = toRad(pesantrenLat);
    const Δφ = toRad(pesantrenLat - userLat);
    const Δλ = toRad(pesantrenLng - userLng);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance <= radius;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setIsSuccess(false);
      setMessage("Silakan ambil foto terlebih dahulu.");
      if (onError) onError("Silakan ambil foto terlebih dahulu.");
      return;
    }

    try {
      const position = await getUserLocation();
      const { latitude, longitude } = position.coords;
      const pesantrenLat = -6.302114872671908;
      const pesantrenLng = 106.64997821247849;
      const radius = 100;

      // if (
      //   !isWithinRadius(latitude, longitude, pesantrenLat, pesantrenLng, radius)
      // ) {
      //   setIsSuccess(false);
      //   setMessage(
      //     "Absensi hanya dapat dilakukan di dalam lingkungan pesantren."
      //   );
      //   if (onError)
      //     onError(
      //       "Absensi hanya dapat dilakukan di dalam lingkungan pesantren."
      //     );
      //   return;
      // }

      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(",")[1];

        const detectionResult = await faceService.detectFaceFromBase64(
          base64Data
        );
        if (!detectionResult.success) {
          setIsSuccess(false);
          setMessage(detectionResult.error || "Wajah tidak terdeteksi");
          if (onError)
            onError(detectionResult.error || "Wajah tidak terdeteksi");
          return;
        }

        const formData = new FormData();
        formData.append("photo", base64Data);
        formData.append(
          "faceDescriptor",
          JSON.stringify(detectionResult.descriptor)
        );
        formData.append("type", type);
        if (isNewFace && name) {
          formData.append("name", name);
        }

        const res = await fetch("/api/attendance", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        setIsSuccess(data.success);
        setMessage(data.message);
        setIsNewFace(data.isNewFace ?? null);

        if (data.name) {
          setRecognizedName(data.name);
          setAttendanceTime(data.timestamp);
          if (onSuccess) onSuccess(data.name, data.timestamp);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.log(error);
      setIsSuccess(false);
      setMessage("Tidak dapat mengambil lokasi. Pastikan GPS diaktifkan.");
      if (onError)
        onError("Tidak dapat mengambil lokasi. Pastikan GPS diaktifkan.");
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={toggleCamera}
        className="w-full bg-[#48A6A7] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#3d9395] transition-all duration-300 mb-4"
      >
        {isCameraActive ? "Matikan Kamera" : "Aktifkan Kamera"}
      </button>

      {isCameraActive && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-xl border-2 border-gray-200"
          />
          <button
            onClick={capturePhoto}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all duration-300"
          >
            Ambil Foto
          </button>
        </div>
      )}

      {selectedFile && (
        <div className="mb-6 relative w-full h-64">
          <Image
            src={URL.createObjectURL(selectedFile)}
            alt="Preview"
            fill
            className="rounded-xl border-2 border-gray-200 object-cover"
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {isNewFace && (
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Nama Anda
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#48A6A7] focus:border-transparent"
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-[#48A6A7] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#3d9395] transition-all duration-300"
        >
          Submit Absensi
        </button>
      </form>

      {message && (
        <div
          className={`mt-6 text-center text-sm font-semibold ${
            isSuccess ? "text-green-600" : "text-red-500"
          }`}
        >
          {message}
        </div>
      )}

      {recognizedName && attendanceTime && (
        <div className="mt-6 text-center">
          <div className="text-lg font-semibold text-[#006A71]">
            Selamat datang, {recognizedName}!
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Waktu absen: {attendanceTime}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { handleAbsensi } from "./action";
import { FaceRecognitionService } from "@/services/faceRecognition";

export default function AbsensiPage() {
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
    if (isCameraActive) {
      startCamera();
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
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
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
    const R = 6371e3; // Radius bumi dalam meter
    const φ1 = toRad(userLat);
    const φ2 = toRad(pesantrenLat);
    const Δφ = toRad(pesantrenLat - userLat);
    const Δλ = toRad(pesantrenLng - userLng);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Jarak dalam meter

    return distance <= radius;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setIsSuccess(false);
      setMessage("Silakan ambil foto terlebih dahulu.");
      return;
    }

    try {
      const position = await getUserLocation();
      const { latitude, longitude } = position.coords;
      const pesantrenLat = -6.302114872671908; // Ganti dengan koordinat latitude pesantren
      const pesantrenLng = 106.64997821247849; // Ganti dengan koordinat longitude pesantren
      const radius = 100; // Radius dalam meter

      if (
        !isWithinRadius(latitude, longitude, pesantrenLat, pesantrenLng, radius)
      ) {
        setIsSuccess(false);
        setMessage(
          "Absensi hanya dapat dilakukan di dalam lingkungan pesantren."
        );
        return;
      }

      if (
        isWithinRadius(latitude, longitude, pesantrenLat, pesantrenLng, radius)
      ) {
        setMessage("Absensi berhasil dilakukan di dalam lokasi pesantren.");
        setIsSuccess(true);
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(",")[1]; // Remove the data URL prefix

        // Detect face and get descriptor
        const detectionResult = await faceService.detectFaceFromBase64(
          base64Data
        );
        if (!detectionResult.success) {
          setIsSuccess(false);
          setMessage(detectionResult.error || "Wajah tidak terdeteksi");
          return;
        }

        const formData = new FormData();
        formData.append("photo", base64Data);
        formData.append(
          "faceDescriptor",
          JSON.stringify(detectionResult.descriptor)
        );
        if (isNewFace && name) {
          formData.append("name", name);
        }

        const res = await handleAbsensi(formData);
        setIsSuccess(res.success);
        setMessage(res.message);
        setIsNewFace(res.isNewFace ?? null);
        if (res.name) {
          setRecognizedName(res.name);
        }
        if (res.timestamp) {
          const date = new Date(res.timestamp);
          setAttendanceTime(
            date.toLocaleString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          );
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      setIsSuccess(false);
      setMessage("Tidak dapat mengambil lokasi. Pastikan GPS diaktifkan.");
    }
  };

  return (
    <div className="min-h-screen bg-[#9ACBD0] flex items-center justify-center px-4 py-10">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg border border-[#48A6A7]">
        <h2 className="text-3xl font-bold text-[#006A71] text-center mb-6">
          Absensi Santri
        </h2>

        <div className="mb-6">
          <button
            onClick={() => setIsCameraActive(!isCameraActive)}
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
        </div>

        {selectedFile && (
          <div className="mb-6">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              className="w-full rounded-xl border-2 border-gray-200"
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

        {recognizedName && (
          <div className="mt-6 text-center">
            <div className="text-lg font-semibold text-[#006A71]">
              Selamat datang, {recognizedName}!
            </div>
            {attendanceTime && (
              <div className="text-sm text-gray-600 mt-2">
                Waktu absen: {attendanceTime}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

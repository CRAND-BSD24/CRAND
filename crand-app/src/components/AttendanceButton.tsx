"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaceRecognitionService } from "@/services/faceRecognition";
import Image from "next/image";
import { isValidAttendanceTime, getRoleCurrentShift } from "@/lib/shift-utils";

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
  const [isWithinLocation, setIsWithinLocation] = useState<boolean | null>(
    null
  );
  const [locationMessage, setLocationMessage] = useState("");
  const [submitTime, setSubmitTime] = useState<string>("");

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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        // Pastikan metadata dimuat sehingga videoWidth/videoHeight valid
        if (video.readyState < 2) {
          await new Promise<void>((resolve) => {
            const handler = () => {
              video.removeEventListener("loadedmetadata", handler);
              resolve();
            };
            video.addEventListener("loadedmetadata", handler, { once: true });
          });
        }
        // Mulai playback untuk memastikan frame tersedia
        video.play();
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
      const vw = videoRef.current.videoWidth;
      const vh = videoRef.current.videoHeight;
      if (!vw || !vh) {
        setIsSuccess(false);
        setMessage("Kamera belum siap. Tunggu 1–2 detik lalu coba lagi.");
        if (onError) onError("Kamera belum siap. Tunggu 1–2 detik lalu coba lagi.");
        return;
      }
      canvas.width = vw;
      canvas.height = vh;
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
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Akurasi lokasi:', {
              accuracy: Math.round(position.coords.accuracy),
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed
            });
            resolve(position);
          },
          (error) => {
            console.error('Error geolokasi:', {
              code: error.code,
              message: error.message
            });
            let errorMessage = "Tidak dapat mengambil lokasi.";
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Izin akses lokasi ditolak. Mohon aktifkan izin lokasi di pengaturan browser.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Informasi lokasi tidak tersedia. Pastikan GPS aktif dan ada sinyal yang cukup.";
                break;
              case error.TIMEOUT:
                errorMessage = "Waktu mendapatkan lokasi habis. Silakan coba lagi.";
                break;
            }
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0,
          }
        );
      } else {
        reject(new Error("Geolocation tidak didukung oleh browser ini."));
      }
    });
  };

  const isWithinRadius = (
    userLat: number,
    userLng: number,
    locations: Array<{ lat: number; lng: number }>,
    radius: number
  ): boolean => {
    const R = 6371e3; // Earth's radius in meters

    for (const location of locations) {
      const φ1 = (userLat * Math.PI) / 180;
      const φ2 = (location.lat * Math.PI) / 180;
      const Δφ = ((location.lat - userLat) * Math.PI) / 180;
      const Δλ = ((location.lng - userLng) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      console.log('Jarak ke lokasi:', {
        lokasi: location,
        jarak: Math.round(distance),
        dalamRadius: distance <= radius
      });

      if (distance <= radius) {
        return true;
      }
    }
    return false;
  };

  const BUFFER_MINUTES = 10;
  const checkAttendanceTime = (): { isValid: boolean; message: string; isLate?: boolean; lateMinutes?: number } => {
    const role = type === "admin" ? "admin" : "teacher";
    const result = isValidAttendanceTime(new Date(), role, BUFFER_MINUTES);
    if (!result.isValid) {
      const label = getRoleCurrentShift(role);
      return {
        isValid: false,
        message: `${result.message}${label !== "Di luar jadwal" ? ` (Saat ini: ${label})` : ""}`,
      };
    }
    return result;
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `pukul ${hours}.${minutes} WIB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentTime = new Date();
    setSubmitTime(formatTime(currentTime));
    let lat: number | null = null;
    let lng: number | null = null;

    if (!selectedFile) {
      setIsSuccess(false);
      setMessage("Silakan ambil foto terlebih dahulu.");
      if (onError) onError("Silakan ambil foto terlebih dahulu.");
      return;
    }

    // Cek waktu absensi
    const timeCheck = checkAttendanceTime();
    if (!timeCheck.isValid) {
      setIsSuccess(false);
      setMessage(timeCheck.message);
      if (onError) onError(timeCheck.message);
      return;
    }

    const ENABLE_LOCATION_CHECK = true;
    if (ENABLE_LOCATION_CHECK) {
      try {
        const position = await getUserLocation();
        const { latitude, longitude } = position.coords;
        lat = latitude;
        lng = longitude;
        
        console.log('Lokasi pengguna:', { latitude, longitude });
        
        // Lokasi yang diizinkan
        const allowedLocations = [
          { lat: -5.9943049319879425, lng: 106.04812321979192 },
          { lat: -5.979029363145886, lng: 106.0590577982583 }
        ];
        const radius = 500; // dalam meter

        console.log('Menghitung jarak ke lokasi yang diizinkan...');
        
        const isWithin = isWithinRadius(
          latitude,
          longitude,
          allowedLocations,
          radius
        );
        console.log('Hasil pengecekan lokasi:', { isWithin });
        
        setIsWithinLocation(isWithin);

        if (!isWithin) {
          setIsSuccess(false);
          setMessage(
            "Absensi hanya dapat dilakukan di lokasi yang ditentukan."
          );
          setLocationMessage("Anda berada di luar area yang ditentukan");
          if (onError)
            onError(
              "Absensi hanya dapat dilakukan di lokasi yang ditentukan."
            );
          return;
        }

        setLocationMessage("Anda berada di area yang diizinkan");
      } catch (error) {
        console.log(error);
        setIsSuccess(false);
        const errorMessage = error instanceof Error ? error.message : "Tidak dapat mengambil lokasi. Pastikan GPS diaktifkan dan ada sinyal yang cukup.";
        setMessage(errorMessage);
        if (onError) onError(errorMessage);
        return;
      }
    } else {
      setIsWithinLocation(null);
      setLocationMessage("");
    }

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
      if (ENABLE_LOCATION_CHECK && lat !== null && lng !== null) {
        formData.append("latitude", String(lat));
        formData.append("longitude", String(lng));
      }
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
  };

  return (
    <div className="mb-6">
      <button
        onClick={toggleCamera}
        className="w-full bg-emerald-800 text-white py-3 px-4 rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-300 mb-4 flex items-center justify-center gap-2 shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isCameraActive ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            Matikan Kamera
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            Aktifkan Kamera
          </>
        )}
      </button>

      {isCameraActive && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-xl border-2 border-emerald-300 shadow-md bg-emerald-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl pointer-events-none"></div>
          <button
            onClick={capturePhoto}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-emerald-800 text-white p-3 rounded-full hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center w-14 h-14 hover:scale-105 active:scale-95"
            aria-label="Ambil Foto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="absolute top-3 right-3 bg-emerald-800/80 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
            Kamera Aktif
          </div>
        </div>
      )}

      {selectedFile && (
        <div className="mb-6 mt-5 relative w-full h-64 group">
          <Image
            src={URL.createObjectURL(selectedFile)}
            alt="Preview"
            fill
            className="rounded-xl border-2 border-emerald-300 object-cover shadow-md transition-all duration-300 group-hover:shadow-lg"
          />
          <div className="absolute top-3 right-3 bg-emerald-800/80 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
            Foto Siap
          </div>
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
              className="w-full border-2 border-emerald-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all duration-200"
              required
              placeholder="Masukkan nama lengkap Anda"
            />
          </div>
        )}

        {(() => {
          const role = type === "admin" ? "admin" : "teacher";
          const timeCheck = isValidAttendanceTime(new Date(), role, BUFFER_MINUTES);
          const currentLabel = getRoleCurrentShift(role);
          return (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 font-medium">
                  Jadwal saat ini: {currentLabel}
                </div>
                {!timeCheck.isValid && (
                  <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-2 py-1">
                    Di luar jadwal
                  </div>
                )}
                {timeCheck.isValid && timeCheck.isLate && (
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
                    Terlambat {timeCheck.lateMinutes} menit
                  </div>
                )}
              </div>
              <button
          type="submit"
          className={`w-full mt-3 bg-emerald-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md transform hover:scale-[1.02] active:scale-[0.98] ${
            timeCheck.isValid ? "hover:bg-emerald-700" : "opacity-60 cursor-not-allowed"
          }`}
          disabled={!timeCheck.isValid}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Submit Absensi
        </button>
            </>
          );
        })()}
      </form>

      {message && (
        <div
          className={`mt-6 p-3 rounded-lg text-center text-sm font-semibold ${
            isSuccess ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            {isSuccess ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {message}
          </div>
        </div>
      )}

      {recognizedName && attendanceTime && (
        <div className="mt-6 p-4 text-center bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
          <div className="text-lg font-semibold text-emerald-800 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Selamat datang, {recognizedName}!
          </div>
          <div className="flex items-center justify-center gap-1 text-sm text-emerald-700 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Waktu absen: {attendanceTime}
          </div>
        </div>
      )}

      {locationMessage && (
        <div
          className={`mb-4 p-4 rounded-xl text-center shadow-sm border ${
            isWithinLocation
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          <div className="text-sm font-medium flex items-center justify-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Status Lokasi
          </div>
          <div className="text-lg font-semibold mt-1 flex items-center justify-center gap-2">
            {isWithinLocation ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {locationMessage}
          </div>
        </div>
      )}

      {submitTime && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-50 text-emerald-800 text-center border border-emerald-200 shadow-sm">
          <div className="text-sm font-medium flex items-center justify-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Waktu Absensi
          </div>
          <div className="text-lg font-semibold mt-1">{submitTime}</div>
        </div>
      )}
    </div>
  );
}

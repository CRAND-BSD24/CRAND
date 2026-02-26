"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaceRecognitionService } from "@/services/faceRecognition";
import Image from "next/image";
import { isValidAttendanceTime, getRoleCurrentShift, Role } from "@/lib/shift-utils";
import { Loader2, MapPin, CheckCircle } from "lucide-react";

interface AttendanceButtonProps {
  onSuccess?: (name: string, timestamp: string) => void;
  onError?: (message: string) => void;
  type?: "teacher" | "admin" | "staff" | "educator" | "manager";
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
  const [hasFaceDetection, setHasFaceDetection] = useState(false);
  const [isGpsActive, setIsGpsActive] = useState<boolean | null>(null);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const detectionLoopRef = useRef<number | null>(null);
  const faceServiceRef = useRef<FaceRecognitionService | null>(null);
  const lastDescriptorRef = useRef<number[] | null>(null);

  const getFaceService = () => {
    if (!faceServiceRef.current) {
      faceServiceRef.current = FaceRecognitionService.getInstance();
    }
    return faceServiceRef.current;
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
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
  }, [onError]);

  useEffect(() => {
    if (isCameraActive) {
      setIsGpsLoading(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => {
            setIsGpsActive(true);
            setIsGpsLoading(false);
          },
          () => {
            setIsGpsActive(false);
            setIsGpsLoading(false);
          }
        );
      } else {
        setIsGpsActive(false);
        setIsGpsLoading(false);
      }
      
      const startDetectionLoop = () => {
        if (!videoRef.current) return;
        if (detectionLoopRef.current !== null) {
          window.clearInterval(detectionLoopRef.current);
        }
        detectionLoopRef.current = window.setInterval(async () => {
          if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;
          try {
            const result = await getFaceService().detectFaceFromVideo(
              videoRef.current
            );
            if (result.success) {
              setHasFaceDetection(!!result.hasFace);
              if (result.descriptor) {
                lastDescriptorRef.current = result.descriptor;
              }
            }
          } catch (error) {
            console.error("Error in face detection loop:", error);
          }
        }, 800);
      };

      startCamera().then(() => {
         startDetectionLoop();
      });
    } else {
      stopCamera();
      setIsGpsActive(null);
      setIsGpsLoading(false);
      setHasFaceDetection(false);
      if (detectionLoopRef.current !== null) {
        window.clearInterval(detectionLoopRef.current);
        detectionLoopRef.current = null;
      }
    }
    return () => {
      stopCamera();
      if (detectionLoopRef.current !== null) {
        window.clearInterval(detectionLoopRef.current);
        detectionLoopRef.current = null;
      }
    };
  }, [isCameraActive, startCamera, stopCamera]);

  useEffect(() => {
    if (isModalOpen) {
      setIsCameraActive(true);
    } else {
      stopCamera();
      setIsCameraActive(false);
    }
  }, [isModalOpen, stopCamera]);

  const capturePhoto = () => {
    if (!hasFaceDetection) {
      setMessage("Wajah belum terdeteksi. Pastikan wajah terlihat jelas di kamera.");
      return;
    }

    if (isWithinLocation === false) {
      setMessage("Anda berada di luar lokasi absensi yang diizinkan.");
      return;
    }

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
            setHasFaceDetection(true);
            handleSubmitWithFile(file);
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

  const checkAttendanceTime = (): { isValid: boolean; message: string; isLate?: boolean; lateMinutes?: number } => {
    const role = type as Role;
    const result = isValidAttendanceTime(new Date(), role);
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

  const handleSubmitWithFile = async (file: File | null) => {
    const currentTime = new Date();
    setSubmitTime(formatTime(currentTime));
    let lat: number | null = null;
    let lng: number | null = null;

    if (!file) {
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
      let descriptor = lastDescriptorRef.current;

      if (!descriptor) {
        const detectionResult = await getFaceService().detectFaceFromBase64(
          base64Data
        );
        if (!detectionResult.success) {
          setHasFaceDetection(false);
          setIsSuccess(false);
          setMessage(detectionResult.error || "Wajah tidak terdeteksi");
          if (onError)
            onError(detectionResult.error || "Wajah tidak terdeteksi");
          return;
        }
        descriptor = detectionResult.descriptor || null;
      }

      setHasFaceDetection(true);

      const formData = new FormData();
      formData.append("photo", base64Data);
      formData.append(
        "faceDescriptor",
        JSON.stringify(descriptor)
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

      if (data.success) {
        setIsCameraActive(false);
      }

      if (data.name) {
        setRecognizedName(data.name);
        setAttendanceTime(data.timestamp);
        if (onSuccess) onSuccess(data.name, data.timestamp);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mb-6">
      {isCameraActive && (
        <>
          <div className="relative rounded-2xl overflow-hidden bg-black w-full aspect-[4/3] shadow-inner ring-4 ring-blue-200">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              style={{ transform: "scaleX(-1)" }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />

            <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
              <div
                className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md transition-all duration-300 transform ${
                  hasFaceDetection
                    ? "bg-blue-500/90 text-white scale-105 ring-2 ring-blue-300/80"
                    : "bg-black/70 text-white ring-1 ring-white/20"
                }`}
              >
                {hasFaceDetection ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Terdeteksi
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Mencari Wajah
                  </span>
                )}
              </div>

              <div
                className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md transition-all duration-300 flex items-center gap-1.5 ${
                  isGpsLoading
                    ? "bg-amber-500/90 text-white animate-pulse"
                  : isGpsActive
                    ? "bg-blue-500/90 text-white ring-2 ring-blue-300/80"
                    : "bg-red-500/90 text-white"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                {isGpsLoading
                  ? "Cari GPS..."
                  : isGpsActive
                  ? "GPS Aktif"
                  : "GPS Tidak Aktif"}
              </div>
            </div>

            <div className="absolute inset-0 pointer-events-none m-3 border-2 border-white/15 rounded-2xl">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/60 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/60 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/60 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/60 rounded-br-xl" />
            </div>

            <button
              onClick={capturePhoto}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/40 flex items-center justify-center w-14 h-14 hover:scale-105 active:scale-95"
              aria-label="Ambil Foto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="mt-3 text-center text-xs sm:text-sm text-gray-600">
            Posisikan wajah di dalam bingkai, lalu tekan tombol kamera untuk absensi.
          </div>
        </>
      )}

      <div className="mt-4 space-y-4">
        {(() => {
          const role = ((type as string) === "admin" || (type as string) === "manager" || (type as string) === "staff" || (type as string) === "hrd" || (type as string) === "adminhrd") ? "admin" : (type as Role);
          const timeCheck = isValidAttendanceTime(new Date(), role);
          const currentLabel = getRoleCurrentShift(role);
          return (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-sm text-gray-600 font-medium">
                  Jadwal: {currentLabel}
                </div>
                {!timeCheck.isValid && (
                  <div className="text-xs text-red-700 bg-red-100 border border-red-200 rounded-md px-2 py-1 font-semibold">
                    Di luar jadwal
                  </div>
                )}
                {timeCheck.isValid && timeCheck.isLate && (
                  <div className="text-xs text-amber-700 bg-amber-100 border border-amber-200 rounded-md px-2 py-1 font-semibold">
                    Terlambat {timeCheck.lateMinutes}m
                  </div>
                )}
                 {timeCheck.isValid && !timeCheck.isLate && (
                  <div className="text-xs text-green-700 bg-green-100 border border-green-200 rounded-md px-2 py-1 font-semibold">
                    Tepat Waktu
                  </div>
                )}
            </div>
          );
        })()}
      </div>

      {message && (
        <div
          className={`mt-6 p-3 rounded-lg text-center text-sm font-semibold ${
            isSuccess ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-red-50 text-red-700 border border-red-200"
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
        <div className="mt-6 p-4 text-center bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
          <div className="text-lg font-semibold text-blue-800 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Selamat datang, {recognizedName}!
          </div>
          <div className="flex items-center justify-center gap-1 text-sm text-blue-700 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Waktu absen: {attendanceTime}
          </div>
          {isNewFace && (
            <div className="mt-3 text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full inline-block">
              Wajah berhasil didaftarkan untuk pertama kali
            </div>
          )}
        </div>
      )}

      {locationMessage && (
        <div
          className={`mb-4 p-4 rounded-xl text-center shadow-sm border ${
            isWithinLocation
              ? "bg-blue-50 text-blue-800 border-blue-200"
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
        <div className="mb-4 p-4 rounded-xl bg-blue-50 text-blue-800 text-center border border-blue-200 shadow-sm">
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

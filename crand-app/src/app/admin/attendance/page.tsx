'use client';

import React, { useState, useRef, useEffect } from 'react';
import { handleAbsensi } from './action';
import { FaceRecognitionService } from '@/services/faceRecognition';
import Link from 'next/link';
import Image from 'next/image';

export default function AbsensiPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [isNewFace, setIsNewFace] = useState<boolean | null>(null);
  const [name, setName] = useState('');
  const [recognizedName, setRecognizedName] = useState('');
  const [attendanceTime, setAttendanceTime] = useState<string>('');
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
      console.error('Error accessing camera:', err);
      setMessage('Tidak dapat mengakses kamera');
      setIsSuccess(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            setSelectedFile(file);
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setIsSuccess(false);
      setMessage('Silakan ambil foto terlebih dahulu.');
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1]; // Remove the data URL prefix

      // Detect face and get descriptor
      const detectionResult = await faceService.detectFaceFromBase64(base64Data);
      if (!detectionResult.success) {
        setIsSuccess(false);
        setMessage(detectionResult.error || 'Wajah tidak terdeteksi');
        return;
      }

      const formData = new FormData();
      formData.append('photo', base64Data);
      formData.append('faceDescriptor', JSON.stringify(detectionResult.descriptor));
      if (isNewFace && name) {
        formData.append('name', name);
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
        setAttendanceTime(date.toLocaleString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }));
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="min-h-screen bg-[#9ACBD0] flex flex-col items-center px-4 py-10">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg border border-[#48A6A7] mb-8">
        <h2 className="text-3xl font-bold text-[#006A71] text-center mb-6">
          Absensi Kehadiran
        </h2>

        <div className="mb-6">
          <button
            onClick={() => setIsCameraActive(!isCameraActive)}
            className="w-full bg-[#48A6A7] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#3d9395] transition-all duration-300 mb-4"
          >
            {isCameraActive ? 'Matikan Kamera' : 'Aktifkan Kamera'}
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
          <br />
          <br />
          <Link
            href="/admin/attendance/history"
            className="block w-full bg-[#48A6A7] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#3d9395] transition-all duration-300 text-center"
          >
            Lihat Riwayat Absensi
          </Link>
        </form>

        {message && (
          <div
            className={`mt-6 text-center text-sm font-semibold ${
              isSuccess ? 'text-green-600' : 'text-red-500'
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

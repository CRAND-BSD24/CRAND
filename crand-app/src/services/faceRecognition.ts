'use client';

import * as faceapi from '@vladmandic/face-api';

export class FaceRecognitionService {
  private static instance: FaceRecognitionService;
  private modelsLoaded = false;

  private constructor() {}

  public static getInstance(): FaceRecognitionService {
    if (!FaceRecognitionService.instance) {
      FaceRecognitionService.instance = new FaceRecognitionService();
    }
    return FaceRecognitionService.instance;
  }

  public async loadModels() {
    if (!this.modelsLoaded) {
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      this.modelsLoaded = true;
    }
  }

  public async detectFaceFromBase64(base64Image: string) {
    try {
      await this.loadModels();
      if (!base64Image || base64Image.length < 100) {
        throw new Error('Gambar tidak valid. Silakan ambil ulang foto dengan wajah terlihat jelas.');
      }
      const img = await faceapi.fetchImage(`data:image/jpeg;base64,${base64Image}`);
      // Validasi dimensi gambar agar tidak 0/null
      const width = (img as HTMLImageElement).naturalWidth || (img as HTMLImageElement).width;
      const height = (img as HTMLImageElement).naturalHeight || (img as HTMLImageElement).height;
      if (!width || !height) {
        throw new Error('Gambar gagal dimuat. Coba ambil foto lagi setelah kamera siap.');
      }
      const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 });
      const detections = await faceapi.detectSingleFace(img, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections || !detections.descriptor) {
        throw new Error('No face detected or invalid face descriptor');
      }

      return {
        success: true,
        detection: detections,
        descriptor: Array.from(detections.descriptor)
      };
    } catch (error) {
      console.error('Face detection error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during face detection'
      };
    }
  }

  public async compareFaces(descriptor1: Float32Array, descriptor2: Float32Array) {
    return faceapi.euclideanDistance(descriptor1, descriptor2);
  }
}
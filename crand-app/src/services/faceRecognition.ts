'use client';

import * as faceapi from 'face-api.js';

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
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
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
      const img = await faceapi.fetchImage(`data:image/jpeg;base64,${base64Image}`);
      const detections = await faceapi.detectSingleFace(img)
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
/**
 * Fundus Camera Hardware Abstraction Layer (HAL)
 *
 * Provides a unified interface for connecting to diagnostic retinal cameras.
 * Supports:
 * 1. MockFundusCameraAdapter (for development and demonstration)
 * 2. DeviceWebcamAdapter (using browser MediaDevices API)
 * 3. VendorCameraAdapter (production architecture for Remidio, Forus 3nethra, Volk, etc.)
 */

export const CameraMode = {
  UPLOAD: 'UPLOAD',
  WEBCAM: 'WEBCAM',
  MOCK: 'MOCK',
  VENDOR: 'VENDOR',
};

class BaseFundusAdapter {
  async connect() { throw new Error('Not implemented'); }
  async disconnect() { throw new Error('Not implemented'); }
  async getDeviceStatus() { throw new Error('Not implemented'); }
  async captureImage() { throw new Error('Not implemented'); }
  async testConnection() { throw new Error('Not implemented'); }
}

/**
 * Mock Fundus Camera Adapter (Dev / Testing only)
 */
export class MockFundusCameraAdapter extends BaseFundusAdapter {
  constructor() {
    super();
    this.connected = false;
  }

  async connect() {
    this.connected = true;
    return { success: true, message: 'Connected to Simulated Fundus Scope' };
  }

  async disconnect() {
    this.connected = false;
    return { success: true };
  }

  async getDeviceStatus() {
    return {
      connected: this.connected,
      model: 'DRISHTI Virtual Scope v1.0',
      vendor: 'Simulation Adapter',
      batteryLevel: 98,
      status: this.connected ? 'Ready' : 'Disconnected',
      isDemo: true,
    };
  }

  async captureImage() {
    if (!this.connected) throw new Error('Camera not connected');
    // Returns a high-contrast simulated retinal fundus image
    return {
      success: true,
      imageDataUrl: '/Drishti-AI/eye-cinematic.jpg',
      timestamp: new Date().toISOString(),
      metadata: { fov: '45deg', pupilMydriatic: false, flashIntensity: 'Auto' },
    };
  }

  async testConnection() {
    return { latencyMs: 12, passed: true };
  }
}

/**
 * Browser Device Camera Adapter (Webcam / USB camera / mobile camera)
 */
export class DeviceWebcamAdapter extends BaseFundusAdapter {
  constructor() {
    super();
    this.stream = null;
    this.videoElement = null;
  }

  async connect(videoElement) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera access is not supported by this browser.');
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // prefer back camera on tablets/phones
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoElement) {
        this.videoElement = videoElement;
        this.videoElement.srcObject = this.stream;
        await this.videoElement.play();
      }

      return { success: true, stream: this.stream };
    } catch (err) {
      throw new Error(`Failed to access camera: ${err.message}`);
    }
  }

  async disconnect() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    return { success: true };
  }

  async getDeviceStatus() {
    return {
      connected: !!this.stream,
      model: 'Device Camera (Webcam / OTG Scope)',
      vendor: 'System Camera Driver',
      status: this.stream ? 'Active Video Stream' : 'Disconnected',
      isDemo: false,
    };
  }

  async captureImage() {
    if (!this.videoElement || !this.stream) {
      throw new Error('Video stream is not active.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth || 1280;
    canvas.height = this.videoElement.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    return {
      success: true,
      imageDataUrl: dataUrl,
      timestamp: new Date().toISOString(),
      metadata: { resolution: `${canvas.width}x${canvas.height}` },
    };
  }

  async testConnection() {
    return { passed: !!this.stream };
  }
}

/**
 * Vendor Hardware SDK Adapter (Remidio, Forus 3nethra, Volk iNview, etc.)
 */
export class VendorFundusCameraAdapter extends BaseFundusAdapter {
  constructor(vendorName = 'Remidio / Forus / Volk') {
    super();
    this.vendorName = vendorName;
  }

  async connect() {
    return {
      success: false,
      message: 'Hardware integration ready — vendor SDK required.',
    };
  }

  async disconnect() {
    return { success: true };
  }

  async getDeviceStatus() {
    return {
      connected: false,
      model: `${this.vendorName} Compatible Scope`,
      vendor: this.vendorName,
      status: 'Hardware integration ready — vendor SDK required.',
      isDemo: false,
      requiresSdk: true,
    };
  }

  async captureImage() {
    throw new Error('Vendor SDK is not installed on this workstation.');
  }

  async testConnection() {
    return { passed: false, error: 'Vendor SDK driver not loaded.' };
  }
}

class FundusCameraService {
  constructor() {
    this.adapters = {
      [CameraMode.MOCK]: new MockFundusCameraAdapter(),
      [CameraMode.WEBCAM]: new DeviceWebcamAdapter(),
      [CameraMode.VENDOR]: new VendorFundusCameraAdapter(),
    };
    this.currentMode = CameraMode.UPLOAD;
  }

  getAdapter(mode) {
    return this.adapters[mode] || null;
  }
}

export const fundusCameraService = new FundusCameraService();

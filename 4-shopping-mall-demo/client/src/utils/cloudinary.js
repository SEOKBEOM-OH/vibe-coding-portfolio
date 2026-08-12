/**
 * Cloudinary Upload Widget 헬퍼
 *
 * 필요 env (client/.env):
 *   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *   VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
 *
 * Cloudinary Console → Settings → Upload → Upload presets
 * 에서 Signing Mode = Unsigned 인 preset을 만들고 이름을 넣는다.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export function isCloudinaryConfigured() {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

/** index.html 스크립트가 로드될 때까지 대기 */
function waitForCloudinary(timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    if (window.cloudinary?.createUploadWidget) {
      resolve(window.cloudinary);
      return;
    }

    const started = Date.now();
    const timer = setInterval(() => {
      if (window.cloudinary?.createUploadWidget) {
        clearInterval(timer);
        resolve(window.cloudinary);
        return;
      }

      if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        reject(new Error('Cloudinary 위젯 스크립트를 불러오지 못했습니다.'));
      }
    }, 50);
  });
}

/**
 * Upload Widget 열기
 * @param {{ onSuccess?: (info: object) => void, onError?: (error: unknown) => void }} options
 */
export async function openCloudinaryUploadWidget({ onSuccess, onError } = {}) {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary 설정이 없습니다.\nclient/.env 에 VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET 를 추가한 뒤 개발 서버를 재시작하세요.'
    );
  }

  const cloudinary = await waitForCloudinary();

  const widget = cloudinary.createUploadWidget(
    {
      cloudName: CLOUD_NAME,
      uploadPreset: UPLOAD_PRESET,
      sources: ['local', 'url', 'camera'],
      multiple: false,
      maxFiles: 1,
      resourceType: 'image',
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      cropping: false,
      folder: 'shopping-mall/products',
    },
    (error, result) => {
      if (error) {
        onError?.(error);
        return;
      }

      if (result?.event === 'success' && result.info) {
        onSuccess?.(result.info);
      }
    }
  );

  widget.open();
  return widget;
}

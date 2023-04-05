// From https://github.com/trekhleb/trekhleb.github.io/blob/master/src/posts/2021/gyro-web/components/useDeviceOrientation.ts
// LICENSE : 0BSD

import {
  useCallback,
  useEffect,
  useState,
} from "https://cdn.skypack.dev/react@18.2.0?dts";

// @see: https://developer.mozilla.org/en-US/docs/Web/API/Detecting_device_orientation
export type DeviceOrientation = {
  absolute: boolean,
  alpha: number | null,
  beta: number | null,
  gamma: number | null,
}

type UseDeviceOrientationData = {
  orientation: DeviceOrientation | null,
  error: Error | null,
  // The requestAccess() could only be called on a user gesture (e.g. on click).
  // @see: https://developer.apple.com/forums/thread/128376
  requestAccess: () => Promise<boolean>,
  revokeAccess: () => Promise<void>,
};

const roundAngle = (angle: number | null): number | null => {
  if (typeof angle !== 'number') {
    return angle;
  }
  const fractionDigits = 2;
  return +angle.toFixed(fractionDigits);
};

export const useDeviceOrientation = (): UseDeviceOrientationData => {
  const [error, setError] = useState<Error | null>(null);
  const [orientation, setOrientation] = useState<DeviceOrientation | null>(null);

  const onDeviceOrientation = (event: DeviceOrientationEvent): void => {
    const angles: DeviceOrientation = {
      alpha: roundAngle(event.alpha),
      beta: roundAngle(event.beta),
      gamma: roundAngle(event.gamma),
      absolute: event.absolute,
    };
    setOrientation(angles);
  };

  const revokeAccessAsync = async (): Promise<void> => {
    window.removeEventListener('deviceorientation', onDeviceOrientation);
    setOrientation(null);
  };

  const requestAccessAsync = async (): Promise<boolean> => {
    if (!DeviceOrientationEvent) {
      setError(new Error('Device orientation event is not supported by your browser'));
      return false;
    }

    // Requesting the permission to access device orientation in iOS.
    // @see: https://developer.apple.com/forums/thread/128376
    if (
      // @ts-ignore
      DeviceOrientationEvent.requestPermission
      // @ts-ignore
      && typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
      let permission: PermissionState;
      try {
        // @ts-ignore
        permission = await DeviceOrientationEvent.requestPermission();
      } catch (err) {
        // @ts-ignore
        const e = new Error((err && err.message) || 'unknown error');
        setError(e);
        return false;
      }
      if (permission !== 'granted') {
        setError(new Error('Request to access the device orientation was rejected'));
        return false;
      }
    }

    window.addEventListener('deviceorientation', onDeviceOrientation);

    return true;
  };

  const requestAccess = useCallback(requestAccessAsync, []);
  const revokeAccess = useCallback(revokeAccessAsync, []);

  useEffect(() => {
    return (): void => {
      revokeAccess();
    };
  }, [revokeAccess]);

  return {
    orientation,
    error,
    requestAccess,
    revokeAccess,
  };
};

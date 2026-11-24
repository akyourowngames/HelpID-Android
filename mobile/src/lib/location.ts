import { Platform } from 'react-native';
import * as Location from 'expo-location';

export type SosLocation = {
  coordinates: { latitude: number; longitude: number } | null;
  denied: boolean;
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(null);
      });
  });
}

export async function getSosLocation(): Promise<SosLocation> {
  if (Platform.OS === 'web') return { coordinates: null, denied: false };
  try {
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      const requested = await Location.requestForegroundPermissionsAsync();
      status = requested.status;
    }
    if (status !== 'granted') return { coordinates: null, denied: true };

    const last = await Location.getLastKnownPositionAsync();
    if (last) {
      return {
        coordinates: { latitude: last.coords.latitude, longitude: last.coords.longitude },
        denied: false,
      };
    }

    const current = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      3500,
    );
    if (!current) return { coordinates: null, denied: false };
    return {
      coordinates: {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      },
      denied: false,
    };
  } catch {
    return { coordinates: null, denied: false };
  }
}

export function mapsLink(coords: { latitude: number; longitude: number } | null): string {
  if (!coords) return '';
  return `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
}

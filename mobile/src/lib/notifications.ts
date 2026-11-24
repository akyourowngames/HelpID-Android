import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const FOLLOW_UP_KEY = 'helpid.followups';
const CHANNEL_ID = 'sos-alerts';

export function configureNotifications(): void {
  if (Platform.OS === 'web') return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Emergency alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    }).catch(() => undefined);
  }
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.status === 'granted') return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === 'granted';
  } catch {
    return false;
  }
}

async function present(title: string, body: string): Promise<void> {
  if (Platform.OS === 'web') return;
  if (!(await ensureNotificationPermission())) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: false },
      trigger: null,
    });
  } catch {
    // best effort
  }
}

export function notifySosDelivered(title: string, body: string): void {
  present(title, body).catch(() => undefined);
}

export function notifySosFailed(title: string, body: string): void {
  present(title, body).catch(() => undefined);
}

export async function scheduleFollowUps(
  title: string,
  body: string,
  updates = 4,
  intervalMinutes = 3,
): Promise<number> {
  if (Platform.OS === 'web') return 0;
  if (!(await ensureNotificationPermission())) return 0;
  await cancelFollowUps();

  const ids: string[] = [];
  for (let step = 1; step <= updates; step += 1) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: false },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: step * intervalMinutes * 60,
          repeats: false,
          channelId: CHANNEL_ID,
        } as Notifications.NotificationTriggerInput,
      });
      ids.push(id);
    } catch {
      break;
    }
  }

  if (ids.length > 0) {
    await AsyncStorage.setItem(FOLLOW_UP_KEY, JSON.stringify(ids));
  } else {
    await AsyncStorage.removeItem(FOLLOW_UP_KEY);
  }
  return ids.length;
}

export async function cancelFollowUps(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(FOLLOW_UP_KEY);
    if (raw) {
      const ids = JSON.parse(raw) as string[];
      await Promise.all(
        ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)),
      );
    }
  } catch {
    // ignore malformed cache
  }
  await AsyncStorage.removeItem(FOLLOW_UP_KEY);
  if (Platform.OS !== 'web') {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {
      // best effort
    }
  }
}

export async function followUpsActive(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(FOLLOW_UP_KEY);
    if (!raw) return false;
    const ids = JSON.parse(raw) as string[];
    return Array.isArray(ids) && ids.length > 0;
  } catch {
    return false;
  }
}

import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import { AsyncStorage } from 'react-native';
import * as globals from '../util/globals';

export const registerForPushNotificationsAsync = async () => {
  if (Constants.isDevice) {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    const token = await Notifications.getExpoPushTokenAsync({experienceId: '@mercately/mercately'});
    globals.token = token.data
    await AsyncStorage.setItem('PushNotificationToken', token.data);
  } else {
    alert('Must use physical device for Push Notifications');
  }
}

/**
 * This listener is fired whenever a user taps on or interacts with a
 * notification
 * @param handler
 */
export const addNotificationResponseReceivedListener = (handler) => {
  Notifications.addNotificationResponseReceivedListener(handler);
}


export const setForegroundNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

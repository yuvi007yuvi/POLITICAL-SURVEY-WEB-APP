import AsyncStorage from "@react-native-async-storage/async-storage";

const queueKey = "political-soch-offline-queue";

export const offlineQueue = {
  list: async () => {
    const raw = await AsyncStorage.getItem(queueKey);
    return raw ? JSON.parse(raw) : [];
  },
  add: async (item) => {
    const current = await offlineQueue.list();
    const next = [...current, item];
    await AsyncStorage.setItem(queueKey, JSON.stringify(next));
    return next;
  },
  replace: async (items) => {
    await AsyncStorage.setItem(queueKey, JSON.stringify(items));
  },
  clear: async () => {
    await AsyncStorage.removeItem(queueKey);
  }
};


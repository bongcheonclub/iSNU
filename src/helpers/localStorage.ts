import AsyncStorage from '@react-native-async-storage/async-storage';
import type {fetchCrawlData} from '../InitializeData/FetchData';
import {Awaited} from './type';

export type LocalStorage = {
  favoriteCafes: string[];
  favoriteMarts: string[];
  favoriteShuttles: string[];
  favoriteMeals: string[];
  cachedResponses: {
    date: string;
    data: Awaited<ReturnType<typeof fetchCrawlData>>;
  };
  wasViewedNotice: boolean;
};

export async function getItem<T extends keyof LocalStorage>(
  key: T,
): Promise<LocalStorage[T] | null> {
  const item = await AsyncStorage.getItem(key);
  const parsedItem =
    item != null ? (JSON.parse(item) as LocalStorage[T]) : null;
  return parsedItem;
}

export async function setItem<T extends keyof LocalStorage>(
  key: T,
  value: LocalStorage[T],
): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {fetchCrawlData} from '../InitializeData/FetchData';
import {Awaited} from './type';

export type LOCAL_STORAGE = {
  favoriteCafes: string[];
  favoriteMarts: string[];
  favoriteShuttles: string[];
  favoriteMeals: string[];
  cachedResponses: {
    date: string;
    data: Awaited<ReturnType<typeof fetchCrawlData>>;
  };
};

export async function getItem<T extends keyof LOCAL_STORAGE>(
  key: T,
): Promise<LOCAL_STORAGE[T] | null> {
  const item = await AsyncStorage.getItem(key);
  const parsedItem =
    item != null ? (JSON.parse(item) as LOCAL_STORAGE[T]) : null;
  return parsedItem;
}

export async function setItem<T extends keyof LOCAL_STORAGE>(
  key: T,
  value: LOCAL_STORAGE[T],
): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

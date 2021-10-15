import AsyncStorage from '@react-native-async-storage/async-storage';
import {getItem, setItem} from '../helpers/localStorage';
import {getTodaysDate} from '../helpers/getTodaysDate';
import {processMealData} from './ProcessMealData';
import {fetchCrawlData, fetchLocalStoreageData} from './FetchData';
import {processCafeData, processMartData} from './ProcessOthersData';

export async function initializeData() {
  const {
    favoriteCafes,
    favoriteMarts,
    favoriteShuttles,
    favoriteMeals,
    cachedResponses,
    wasViewedNotice,
  } = await fetchLocalStoreageData();

  const responses = await (async () => {
    const {month, date} = getTodaysDate();
    const nowDate = `${month}/${date}`;
    if (cachedResponses) {
      const {date: cachedDate, data: cachedData} = cachedResponses;

      if (cachedDate === nowDate) {
        return cachedData;
      }
    }
    const fetchedData = await fetchCrawlData();
    await setItem('cachedResponses', {
      data: fetchedData,
      date: nowDate,
    });
    return fetchedData;
  })();

  const {cafeRes, martRes, mealListRes, mealDormListRes, mealMenuListRes} =
    responses;

  const mealData = processMealData(
    mealListRes,
    mealDormListRes,
    mealMenuListRes,
    favoriteMeals,
  );

  const cafeData = processCafeData(cafeRes);
  const martData = processMartData(martRes);

  return {
    mealData,
    cafeData,
    martData,
    favoriteCafes: favoriteCafes ?? [],
    favoriteMarts: favoriteMarts ?? [],
    favoriteShuttles: favoriteShuttles ?? [],
    wasViewedNotice: !!wasViewedNotice,
  };
}

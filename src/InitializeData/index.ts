import {setItem} from '../helpers/localStorage';
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

  const {
    cafeRes,
    martRes,
    mealListRes,
    mealDormListRes,
    day0MenuListRes,
    day1MenuListRes,
    day2MenuListRes,
    day_1MenuListRes,
    day_2MenuListRes,
  } = responses;

  const mealData = processMealData(
    mealListRes,
    mealDormListRes,
    day0MenuListRes,
    day1MenuListRes,
    day2MenuListRes,
    day_1MenuListRes,
    day_2MenuListRes,
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

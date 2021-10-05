import axios from 'axios';
import {getItem} from '../helpers/localStorage';

export async function fetchLocalStoreageData() {
  const [
    favoriteCafes,
    favoriteMarts,
    favoriteShuttles,
    favoriteMeals,
    cachedResponses,
  ] = await Promise.all([
    getItem('favoriteCafes'),
    getItem('favoriteMarts'),
    getItem('favoriteShuttles'),
    getItem('favoriteMeals'),
    getItem('cachedResponses'),
  ]);

  return {
    favoriteCafes,
    favoriteMarts,
    favoriteShuttles,
    favoriteMeals,
    cachedResponses,
  };
}

export async function fetchCrawlData() {
  const [cafeRes, martRes, mealListRes, mealDormListRes, mealMenuListRes] =
    await Promise.all([
      axios.get('https://snuco.snu.ac.kr/ko/node/21'),
      axios.get('https://snuco.snu.ac.kr/ko/node/19'),
      axios.get('https://snuco.snu.ac.kr/ko/node/20'),
      axios.get('https://snudorm.snu.ac.kr/food-schedule/'),
      axios.get('https://snuco.snu.ac.kr/ko/foodmenu'),
    ]);
  return {cafeRes, martRes, mealListRes, mealDormListRes, mealMenuListRes};
}

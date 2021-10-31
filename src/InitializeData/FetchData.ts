import axios from 'axios';
import {getDate, getMonth, getYear} from 'date-fns';
import {getItem} from '../helpers/localStorage';

export async function fetchLocalStoreageData() {
  const [
    favoriteCafes,
    favoriteMarts,
    favoriteShuttles,
    favoriteMeals,
    cachedResponses,
    wasViewedNotice,
  ] = await Promise.all([
    getItem('favoriteCafes'),
    getItem('favoriteMarts'),
    getItem('favoriteShuttles'),
    getItem('favoriteMeals'),
    getItem('cachedResponses'),
    getItem('wasViewedNotice'),
  ]);

  return {
    favoriteCafes,
    favoriteMarts,
    favoriteShuttles,
    favoriteMeals,
    cachedResponses,
    wasViewedNotice,
  };
}

export async function fetchCrawlData() {
  // const now = new Date();
  const now = new Date('Tue Oct 26 2021 12:24:15 GMT+0900');
  const year = getYear(now);
  const month = getMonth(now) + 1;
  const date = getDate(now);
  const todayMenuURL = `https://snuco.snu.ac.kr/ko/foodmenu?field_menu_date_value_1%5Bvalue%5D%5Bdate%5D=&field_menu_date_value%5Bvalue%5D%5Bdate%5D=${month}%2F${date}%2F${year}`;
  const tomorrow = new Date(year, month - 1, date + 1);
  const tomorrowYear = getYear(tomorrow);
  const tomorrowMonth = getMonth(tomorrow) + 1;
  const tomorrowDate = getDate(tomorrow);
  const tomorrowMenuURL = `https://snuco.snu.ac.kr/ko/foodmenu?field_menu_date_value_1%5Bvalue%5D%5Bdate%5D=&field_menu_date_value%5Bvalue%5D%5Bdate%5D=${tomorrowMonth}%2F${tomorrowDate}%2F${tomorrowYear}`;
  const [
    cafeRes,
    martRes,
    mealListRes,
    mealDormListRes,
    todayMenuListRes,
    tomorrowMenuListRes,
  ] = await Promise.all([
    axios.get('https://snuco.snu.ac.kr/ko/node/21'),
    axios.get('https://snuco.snu.ac.kr/ko/node/19'),
    axios.get('https://snuco.snu.ac.kr/ko/node/20'),
    axios.get('https://snudorm.snu.ac.kr/food-schedule/'),
    axios.get(todayMenuURL),
    axios.get(tomorrowMenuURL),
  ]);
  return {
    cafeRes,
    martRes,
    mealListRes,
    mealDormListRes,
    todayMenuListRes,
    tomorrowMenuListRes,
  };
}

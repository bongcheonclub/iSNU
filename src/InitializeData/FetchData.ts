import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {getDate, getMonth, getYear} from 'date-fns';
import {getItem} from '../helpers/localStorage';

export async function fetchLocalStoreageData() {
  // AsyncStorage.clear(); // 개발용 코드
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
  // const now = new Date('Tue Oct 26 2021 12:24:15 GMT+0900');
  const now = new Date();
  const year = getYear(now);
  const month = getMonth(now) + 1;
  const date = getDate(now);
  const day0MenuURL = `https://snuco.snu.ac.kr/ko/foodmenu?field_menu_date_value_1%5Bvalue%5D%5Bdate%5D=&field_menu_date_value%5Bvalue%5D%5Bdate%5D=${month}%2F${date}%2F${year}`;

  function getDateMenuURL(
    thisYear: number,
    thisMonth: number,
    thisDate: number,
    offset: number,
  ): string {
    const _day = new Date(thisYear, thisMonth - 1, thisDate + offset);
    const _year = getYear(_day);
    const _month = getMonth(_day) + 1;
    const _date = getDate(_day);
    const _url = `https://snuco.snu.ac.kr/ko/foodmenu?field_menu_date_value_1%5Bvalue%5D%5Bdate%5D=&field_menu_date_value%5Bvalue%5D%5Bdate%5D=${_month}%2F${_date}%2F${_year}`;
    return _url;
  }
  const day1MenuURL = getDateMenuURL(year, month, date, 1);
  const day2MenuURL = getDateMenuURL(year, month, date, 2);
  const day_1MenuURL = getDateMenuURL(year, month, date, -1);
  const day_2MenuURL = getDateMenuURL(year, month, date, -2);
  const [
    cafeRes,
    martRes,
    mealListRes,
    mealDormListRes,
    day0MenuListRes,
    day1MenuListRes,
    day2MenuListRes,
    day_1MenuListRes,
    day_2MenuListRes,
  ] = await Promise.all([
    axios.get('https://snuco.snu.ac.kr/ko/node/21'),
    axios.get('https://snuco.snu.ac.kr/ko/node/19'),
    axios.get('https://snuco.snu.ac.kr/ko/node/20'),
    axios.get('https://snudorm.snu.ac.kr/food-schedule/'),
    axios.get(day0MenuURL),
    axios.get(day1MenuURL),
    axios.get(day2MenuURL),
    axios.get(day_1MenuURL),
    axios.get(day_2MenuURL),
  ]);
  return {
    cafeRes,
    martRes,
    mealListRes,
    mealDormListRes,
    day0MenuListRes,
    day1MenuListRes,
    day2MenuListRes,
    day_1MenuListRes,
    day_2MenuListRes,
  };
}

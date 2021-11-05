import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {addDays, getDate, getMonth, getYear} from 'date-fns';
import {getItem} from '../helpers/localStorage';

export async function fetchLocalStoreageData() {
  AsyncStorage.clear(); // 개발용 코드
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
  const DATE_OFFSETS = [-2, -1, 0, 1, 2];
  function getDateMenuURL(offset: number): string {
    const now = new Date();
    const date = addDays(now, offset);
    const url = `https://snuco.snu.ac.kr/ko/foodmenu?field_menu_date_value_1%5Bvalue%5D%5Bdate%5D=&field_menu_date_value%5Bvalue%5D%5Bdate%5D=${
      getMonth(date) + 1
    }%2F${getDate(date)}%2F${getYear(date)}`;
    return url;
  }
  const menuUrlsWithOffset = DATE_OFFSETS.map(offset => ({
    url: getDateMenuURL(offset),
    offset,
  }));

  const [
    cafeRes,
    martRes,
    mealListRes,
    mealDormListRes,
    [
      dayBefore2MenuListRes,
      dayBefore1MenuListRes,
      day0MenuListRes,
      dayAfter1MenuListRes,
      dayAfter2MenuListRes,
    ],
    ,
  ] = await Promise.all([
    axios.get('https://snuco.snu.ac.kr/ko/node/21'),
    axios.get('https://snuco.snu.ac.kr/ko/node/19'),
    axios.get('https://snuco.snu.ac.kr/ko/node/20'),
    axios.get('https://snudorm.snu.ac.kr/food-schedule/'),
    await Promise.all(
      menuUrlsWithOffset.map(async ({offset, url}) => {
        const res = await axios.get(url);
        return res; // offset 혹은 연월일 리턴해서 활용하기
      }),
    ),
  ]);
  return {
    cafeRes,
    martRes,
    mealListRes,
    mealDormListRes,
    day0MenuListRes,
    dayAfter1MenuListRes,
    dayAfter2MenuListRes,
    dayBefore1MenuListRes,
    dayBefore2MenuListRes,
  };
}

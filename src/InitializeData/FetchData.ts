import axios from 'axios';
import {addDays, getDate, getMonth, getYear} from 'date-fns';
import {getItem} from '../helpers/localStorage';
import {getNow} from '../helpers/getNow';

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
    getItem('newCachedResponses'),
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
  const DATE_OFFSETS = [-2, -1, 0, 1, 2];
  function getDateMenuURL(offset: number): string {
    const date = addDays(getNow(), offset);
    const url = `https://snuco.snu.ac.kr/foodmenu/?date=${getYear(date)}-${
      getMonth(date) + 1
    }-${getDate(date)}`;
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
    axios.get('https://snuco.snu.ac.kr/%EC%B9%B4%ED%8E%98%EC%95%88%EB%82%B4'),
    axios.get('https://snuco.snu.ac.kr/%ED%8E%B8%EC%9D%98%EC%A0%90'),
    axios.get('https://snuco.snu.ac.kr/%EC%8B%9D%EB%8B%B9%EC%95%88%EB%82%B4'),
    axios.get('https://snudorm.snu.ac.kr/food-schedule/'),
    await Promise.all(
      menuUrlsWithOffset.map(async ({url}) => {
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

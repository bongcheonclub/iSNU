import {FAVORITE_STORAGE_KEY} from '../constants';
import axios, {AxiosResponse} from 'axios';
import {chain, keyBy, map} from 'lodash';
import {Node, parse} from 'node-html-parser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  compareAsc,
  getDate,
  getDay,
  getMonth,
  parse as parseTime,
} from 'date-fns';

export type TodaysMenu = {
  [name: string]: {
    breakfast: string;
    lunch: string;
    dinner: string;
    contact: string;
  };
};

export type Cafeteria = {
  name: string;
  contact: string;
  location: string;
  floors: string;
  scale: string;
  customer: string;
  weekday: string;
  saturday: string;
  holiday: string;
};

export type MealData = {
  menu: TodaysMenu;
  cafeteria: {
    [key: string]: Cafeteria;
  };
  mealList: string[];
  favoriteList: string[];
  nonFavoriteList: string[];
  month: number;
  date: number;
  koreanDay: string;
};

// 식단 정보(menu) 및 식당 운영 정보(info) 가져오기, 즐겨찾기 리스트 가져오기
function processMealData(
  mealListRes: AxiosResponse<any>,
  mealDormListRes: AxiosResponse<any>,
  mealMenuListRes: AxiosResponse<any>,
  favoriteMealList: string | null,
) {
  function fetchMenu() {
    // 식단 정보 가져오는 함수
    const html = mealMenuListRes.data;
    const root = parse(html);
    const data: TodaysMenu = {};
    chain(root.querySelector('tbody').childNodes)
      .map(trNode => {
        const trTexts = chain(trNode.childNodes)
          .map((tdNode, idx) =>
            tdNode.innerText
              .split(/\s|\t|\n/)
              .filter(item => item.length > 0)
              .join(' '),
          )
          .value();
        return trTexts;
      })
      .filter(trTexts => trTexts.length > 0)
      .forEach((trTexts, idx) => {
        const [
          blank_1,
          nameAndContact,
          blank_2,
          breakfast,
          blank_3,
          lunch,
          blank_4,
          dinner,
        ] = trTexts;
        const rawName = nameAndContact.split(/\(|\)/)[0];
        const contact = nameAndContact.split(/\(|\)/)[1];
        const name =
          rawName.trim() === '3식당'
            ? rawName.trim()
            : rawName.trim() === '공대간이식당'
            ? '공간'
            : rawName.trim().replace('식당', '');

        data[name] = {breakfast, lunch, dinner, contact};
      })
      .value();

    return data;
  }
  function fetchInfo() {
    // 식당 일반 운영정보 가져오는 함수
    const html = mealListRes.data;
    const root = parse(html);
    const data: Cafeteria[] = chain(root.querySelector('tbody').childNodes)
      .map(trNode => {
        const trTexts = chain(trNode.childNodes)
          .map(tdNode =>
            tdNode.innerText
              .split(/\s|\t|\n/)
              .filter(item => item.length > 0)
              .join(' '),
          )
          .reverse()
          .filter(rows => rows.length > 0)
          .value();
        const [
          holiday,
          saturday,
          weekday,
          customer,
          scale,
          floors,
          location,
          nameAndContact,
        ] = trTexts;
        const [name, contact] = (() => {
          if (nameAndContact === undefined) {
            return ['undefined', 'undefined'];
          } else {
            const rawName = nameAndContact.split(/\(|\)/)[0];

            return [
              rawName.trim() === '3식당'
                ? rawName.trim()
                : rawName.trim() === '공대간이식당'
                ? '공간'
                : rawName.trim().replace('식당', ''),
              nameAndContact.split(/\(|\)/)[1],
            ];
          }
        })();
        return {
          holiday,
          saturday,
          weekday,
          customer,
          scale,
          floors: floors || '2',
          location,
          name:
            name.trim() === '3식당'
              ? name.trim()
              : name.trim() === '공대간이식당'
              ? '공간'
              : name.trim().replace('식당', ''),
          contact,
        };
      })
      .map((item, idx, array) => {
        if (array[idx].location === undefined) {
          array[idx].location = array[idx - 1].location;
        }
        if (array[idx].name === 'undefined') {
          array[idx].name = array[idx - 1].name + ' ' + array[idx].floors;
        }
        if (array[idx].contact === 'undefined') {
          array[idx].contact = array[idx - 1].contact;
        }
        return item;
      })
      .value();
    const processedData = keyBy(data, 'name');
    const refinedMealList = data
      .filter(item => {
        // 학관 지하 등 필터링
        return (
          !item.name.includes(' ') &&
          !item.name.includes('라운지오') &&
          !item.name.includes('두레미담')
        );
      })
      .map(item => {
        return item.name;
      })
      .concat('대학원기숙사');
    processedData['공간'].weekday = '11:00-14:30 15:30-18:30';

    function makeFavoriteInitStates(initialMealList: string[]) {
      // 즐겨찾기 가져오는 함수
      const favoriteList: string[] = favoriteMealList
        ? JSON.parse(favoriteMealList)
        : [];
      const nonFavoriteList = initialMealList.filter(
        mealName => !favoriteList.includes(mealName),
      );
      return {favoriteList, nonFavoriteList};
    }
    const {favoriteList, nonFavoriteList} =
      makeFavoriteInitStates(refinedMealList);

    return {
      cafeteria: processedData,
      mealList: refinedMealList,
      favoriteList,
      nonFavoriteList,
    };
  }
  const menu = fetchMenu();
  const {cafeteria, mealList, favoriteList, nonFavoriteList} = fetchInfo();

  function getTodaysDate() {
    const now = new Date();
    const month = getMonth(now) + 1;
    const date = getDate(now);
    const day = getDay(now);
    const koreanDay = (() => {
      if (day === 0) {
        return '일';
      }
      if (day === 1) {
        return '월';
      }
      if (day === 2) {
        return '화';
      }
      if (day === 3) {
        return '수';
      }
      if (day === 4) {
        return '목';
      }
      if (day === 5) {
        return '금';
      }
      if (day === 6) {
        return '토';
      }
      throw Error('이럴리없다.');
    })();
    return {month, date, koreanDay, day};
  }

  const {month, date, koreanDay, day} = getTodaysDate();

  function processDormData() {
    const html = mealDormListRes.data;
    const root = parse(html);
    const data = chain(root.querySelector('tbody').childNodes)
      .map(trNode => {
        const trTexts = chain(trNode.childNodes)
          .filter(tdNode => {
            const assertedTdNode = tdNode as Node & {
              classList: {_set: string};
            };
            return (
              assertedTdNode !== undefined &&
              assertedTdNode.classList !== undefined &&
              ![...assertedTdNode.classList._set].includes('bg')
            );
          })
          .map((tdNode, idx) => {
            if (tdNode.innerText.length === 0) {
              return ' ';
            }
            return tdNode.innerText;
          })
          .value();
        const [sunday, monday, tuesday, wednesday, thursday, friday, saturday] =
          trTexts;

        return [sunday, monday, tuesday, wednesday, thursday, friday, saturday];
      })
      .filter(item => item[1] !== undefined)
      .value();
    const breakfast = data[0][day] + data[1][day];
    const lunch = data[2][day] + data[3][day] + data[4][day];
    const dinner = data[5][day] + data[6][day] + data[7][day];
    const contact = 'unknown';
    const todaysMenu: TodaysMenu = {
      대학원기숙사: {breakfast, lunch, dinner, contact},
    };
    const menuIncludeOurhome = {...menu, ...todaysMenu};
    const ourhomeCafeteria = {
      name: '대학원기숙사',
      contact: 'unknown',
      location: '901동',
      floors: '1층',
      scale: 'unknown',
      customer: '학생',
      weekday: '08:00-09:30 11:30-13:30 17:30-19:30',
      saturday: '08:00-09:30 11:30-13:30 17:30-19:30',
      holiday: '08:00-09:30 11:30-13:30 17:30-19:30',
    };
    const cafeteriaIncludeOurhome = {
      ...cafeteria,
      대학원기숙사: ourhomeCafeteria,
    };

    return {cafeteriaIncludeOurhome, menuIncludeOurhome};
  }

  const {cafeteriaIncludeOurhome, menuIncludeOurhome} = processDormData();

  return {
    menu: menuIncludeOurhome,
    cafeteria: cafeteriaIncludeOurhome,
    mealList,
    favoriteList,
    nonFavoriteList,
    month,
    date,
    koreanDay,
  };
}

export async function initializeData() {
  const [
    [res, martRes, mealListRes, mealDormListRes, mealMenuListRes],
    [favoriteCafeList, favoriteMartList, favoriteShuttleList, favoriteMealList],
  ] = await Promise.all([
    Promise.all([
      axios.get('https://snuco.snu.ac.kr/ko/node/21'),
      axios.get('https://snuco.snu.ac.kr/ko/node/19'),
      axios.get('https://snuco.snu.ac.kr/ko/node/20'),
      axios.get('https://snudorm.snu.ac.kr/food-schedule/'),
      axios.get('https://snuco.snu.ac.kr/ko/foodmenu'),
    ]),
    Promise.all(map(FAVORITE_STORAGE_KEY, key => AsyncStorage.getItem(key))),
  ]);

  const mealData = processMealData(
    mealListRes,
    mealDormListRes,
    mealMenuListRes,
    favoriteMealList,
  );

  const initialFavoriteCafes = favoriteCafeList
    ? JSON.parse(favoriteCafeList)
    : [];

  const initialFavoriteMarts = favoriteMartList
    ? JSON.parse(favoriteMartList)
    : [];

  const initialFavoriteShuttles = favoriteShuttleList
    ? JSON.parse(favoriteShuttleList)
    : [];
  const html = res.data;
  const root = parse(html);
  const cafes = chain(root.querySelector('tbody').childNodes)
    .map(trNode => {
      const trTexts = chain(trNode.childNodes)
        .map(tdNode =>
          tdNode.innerText
            .split(/\s|\t|\n/)
            .filter(item => item.length > 0)
            .join(' '),
        )
        .filter(rows => rows.length > 0)
        .value();
      const [
        nameWithContact,
        location,
        size,
        items,
        weekday,
        saturday,
        holiday,
      ] = trTexts;
      const [name, contact] = nameWithContact.split(/\(|\)/);
      return {
        name,
        contact,
        location,
        size,
        items,
        weekday,
        saturday,
        holiday,
      };
    })
    .value();
  const martHtml = martRes.data;
  const martRoot = parse(martHtml);
  const marts = chain(martRoot.querySelector('tbody').childNodes)
    .map(trNode => {
      const trTexts = chain(trNode.childNodes)
        .map(tdNode =>
          tdNode.innerText
            .split(/\s|\t|\n/)
            .filter(item => item.length > 0)
            .join(' '),
        )
        .filter(rows => rows.length > 0)
        .value();
      const [name, location, items, weekday, saturday, holiday, contact] =
        trTexts;
      return {
        name,
        location,
        items,
        weekday,
        saturday,
        holiday,
        contact,
      };
    })
    .value();

  return {
    mealData,
    cafes,
    marts,
    initialFavoriteCafes,
    initialFavoriteMarts,
    initialFavoriteShuttles,
  };
}

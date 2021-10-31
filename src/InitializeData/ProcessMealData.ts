import {AxiosResponse} from 'axios';
import {getTodaysDate} from '../helpers/getTodaysDate';

import {chain, keyBy} from 'lodash';
import {Node, parse} from 'node-html-parser';
import {setItem} from '../helpers/localStorage';

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
export function processMealData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mealListRes: AxiosResponse<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mealDormListRes: AxiosResponse<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mealMenuListRes: AxiosResponse<any>,
  favoriteMeals: string[] | null,
) {
  if (favoriteMeals === null) {
    setItem('favoriteMeals', ['학생회관']);
  }
  const favoriteList = favoriteMeals ?? ['학생회관'];
  const {month, date, koreanDay, day} = getTodaysDate();
  function fetchMenu() {
    // 식단 정보 가져오는 함수
    const html = mealMenuListRes.data;
    const root = parse(html);
    const data: TodaysMenu = {};
    chain(root.querySelector('tbody').childNodes)
      .map(trNode => {
        const trTexts = chain(trNode.childNodes)
          .map(tdNode =>
            tdNode.innerText
              .split(/\s|\t|\n/)
              .filter(item => item.length > 0)
              .join(' '),
          )
          .value();
        return trTexts;
      })
      .filter(trTexts => trTexts.length > 0)
      .forEach(trTexts => {
        const nameAndContact = trTexts[1];
        const breakfast = trTexts[3];
        const lunch = trTexts[5];
        const dinner = trTexts[7];
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
        return !item.name.includes(' ') && !item.name.includes('라운지오');
      })
      .map(item => {
        return item.name;
      })
      .concat('대학원기숙사');
    processedData['공간'].weekday = '11:00-14:30 15:30-18:30';

    const nonFavoriteList = refinedMealList.filter(
      mealName => !favoriteList.includes(mealName),
    );

    return {
      cafeteria: processedData,
      mealList: refinedMealList,
      nonFavoriteList,
    };
  }
  const menu = fetchMenu();
  const {cafeteria, mealList, nonFavoriteList} = fetchInfo();

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
          .map(tdNode => {
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

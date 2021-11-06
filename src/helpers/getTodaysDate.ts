import {getDate, getDay, getMonth, getYear} from 'date-fns';
import {convertToKoreanDay} from './convertToKoreanDay';
import {getNow} from './getNow';

export function getTodaysDate() {
  const nowDate = getNow();
  const month = getMonth(nowDate) + 1;
  const date = getDate(nowDate);
  const day = getDay(nowDate);
  const year = getYear(nowDate);
  const koreanDay = convertToKoreanDay(day);
  return {year, month, date, koreanDay, day};
}

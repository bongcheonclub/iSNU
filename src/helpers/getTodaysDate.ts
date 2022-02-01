import {getDate, getDay, getMonth, getYear} from 'date-fns';
import {convertToKoreanDay} from './convertToKoreanDay';
import {getNow} from './getNow';
import {getIsHoliday} from './isHoliday';

export function getTodaysDate() {
  const nowDate = getNow();
  const year = getYear(nowDate);
  const month = getMonth(nowDate) + 1;
  const date = getDate(nowDate);
  const isHoliday = getIsHoliday(nowDate);
  const day = getDay(nowDate);
  const koreanDay = convertToKoreanDay(getDay(nowDate));
  return {year, month, date, koreanDay, day, isHoliday};
}

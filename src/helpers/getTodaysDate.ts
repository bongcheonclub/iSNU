import {getDate, getDay, getMonth, getYear} from 'date-fns';
import {getNow} from './getNow';

export function getTodaysDate() {
  const nowDate = getNow();
  const month = getMonth(nowDate) + 1;
  const date = getDate(nowDate);
  const day = getDay(nowDate);
  const year = getYear(nowDate);
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
  return {year, month, date, koreanDay, day};
}

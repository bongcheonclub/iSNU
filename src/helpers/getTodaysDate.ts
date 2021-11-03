import {getDate, getDay, getMonth, getYear} from 'date-fns';

export function getTodaysDate() {
  const now = new Date();
  // const now = new Date('Tue Oct 26 2021 12:24:15 GMT+0900');
  const month = getMonth(now) + 1;
  const date = getDate(now);
  const day = getDay(now);
  const year = getYear(now);
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

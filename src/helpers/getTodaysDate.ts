import {getDate, getDay, getMonth, getYear} from 'date-fns';
import {convertToKoreanDay} from './convertToKoreanDay';
import {getNow} from './getNow';

export function getTodaysDate() {
  const holidayList = [
    '2022-01-31', // 설연휴
    '2022-02-01', // 설연휴
    '2022-02-02', // 설연휴
    '2022-03-09', // 대통령선거일
    '2022-05-08', // 부처님오신날
    '2022-09-09', // 추석연휴
    '2022-09-10', // 추석연휴
    '2022-09-11', // 추석연휴
    '2022-09-12', // 추석연휴
    '01-01', // 신정
    '03-01', // 삼일절
    '05-05', // 어린이날
    '06-06', // 현충일
    '08-15', // 광복절
    '10-03', // 개천절
    '10-09', // 한글날
    '12-25', // 크리스마스
  ];
  const nowDate = getNow();
  const year = getYear(nowDate);
  const month = getMonth(nowDate) + 1;
  const date = getDate(nowDate);
  const dateString = `${year}-${month < 10 ? '0' + month : month}-${
    date < 10 ? '0' + date : date
  }`;
  const isHoliday = !!holidayList.find(
    today =>
      today === dateString.slice(5, 10) || today === dateString.slice(0, 10),
  );
  const day = isHoliday ? 0 : getDay(nowDate);
  const koreanDay = convertToKoreanDay(getDay(nowDate));
  return {year, month, date, koreanDay, day};
}

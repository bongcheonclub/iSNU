import {getDate, getMonth, getYear} from 'date-fns';

export const getIsHoliday = (dateObject: Date) => {
  const holidayList = [
    '2023-05-27', // 부처님오신날
    '2023-09-28', // 추석연휴
    '2023-09-29', // 추석연휴
    '2023-09-30', // 추석연휴
    '01-01', // 신정
    '03-01', // 삼일절
    '05-05', // 어린이날
    '06-06', // 현충일
    '08-15', // 광복절
    '10-03', // 개천절
    '10-09', // 한글날
    '12-25', // 크리스마스
  ];
  const year = getYear(dateObject);
  const month = getMonth(dateObject) + 1;
  const date = getDate(dateObject);
  const dateString = `${year}-${month < 10 ? '0' + month : month}-${
    date < 10 ? '0' + date : date
  }`;
  const isHoliday = !!holidayList.find(
    today =>
      today === dateString.slice(5, 10) || today === dateString.slice(0, 10),
  );
  return isHoliday;
};

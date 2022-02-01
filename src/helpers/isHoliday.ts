import {getDate, getMonth, getYear} from 'date-fns';

export const getIsHoliday = (dateObject: Date) => {
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

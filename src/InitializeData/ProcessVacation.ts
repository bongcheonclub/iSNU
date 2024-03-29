import {compareAsc} from 'date-fns';
import {getNow} from '../helpers/getNow';
import {Cafeteria} from './ProcessMealData';

export const isVacation = () => {
  const now = getNow();
  const vacationStart = new Date('2023-12-22T00:00+09:00');
  const vacationTermEnd = new Date('2024-01-25T23:59:59+09:00');
  const vacationEnd = new Date('2025-03-01T00:00+09:00');
  if (compareAsc(vacationStart, now) <= 0 && compareAsc(now, vacationEnd) < 0) {
    if (
      compareAsc(vacationTermEnd, now) < 0 &&
      compareAsc(now, vacationEnd) < 0
    ) {
      return 'winterEnd';
    }
    return true;
  } else {
    return false;
  }
};

export const processVacationMeal = (data: Cafeteria, name: string) => {
  if (name === '기숙사') {
    // 아침, 토요일 휴점
    data.weekday = '11:30-13:30 17:30-19:00';
    data.holiday = '11:30-13:30 17:30-19:00';
    data.saturday = '휴관';
  }
  if (name === '220동') {
    // 방학중17:00-18:30, 금요일저녁 휴점(이건 메뉴 정보 없어서 자동 반영)
    data.weekday = '11:00-13:30 17:00-18:30';
  }
  return data;
};

export const processVacationCafe = (data: {
  name: string;
  contact: string;
  location: string;
  size: string;
  items: string;
  weekday: string;
  saturday: string;
  holiday: string;
}) => {
  if (data.name === '느티나무 음대점') {
    data.weekday = '08:30-17:30 (학기중 08:30-18:00)';
  }
  if (data.name === '느티나무 도서관점') {
    data.weekday = '08:30-17:30 (학기중 08:30-18:30)';
  }
  if (data.name === '느티나무 동원관점') {
    data.weekday = '08:30-17:30 (학기중 08:30-18:00)';
  }
  return data;
};

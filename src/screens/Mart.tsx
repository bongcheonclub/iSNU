import React from 'react';
import {compareAsc, parse as parseTime} from 'date-fns';
import Grid from '../components/Grid';
import {getTodaysDate} from '../helpers/getTodaysDate';

type Props = {
  marts: MartData[];
  initialFavoriteNames: string[];
  nowDate: Date;
};

export type MartData = {
  name: string;
  location: string;
  items: string;
  weekday: string;
  saturday: string;
  holiday: string;
  contact: string;
};

function checkOperating(mart: MartData, nowDate: Date): boolean {
  const now = nowDate;

  const {weekday, saturday, holiday} = mart;

  const operatingTime = (() => {
    const day = getTodaysDate().isHoliday ? 0 : getTodaysDate().day;
    switch (day) {
      case 0: // sunday
        return holiday;
      case 6: // saturday
        return saturday;
      default:
        return weekday;
    }
  })();

  if (operatingTime === '휴무') {
    return false;
  }

  if (operatingTime.includes('24시간')) {
    return true;
  }

  if (operatingTime.includes('-') || operatingTime.includes('~')) {
    const spliter = /-|~/;
    const [startAtString, endedAtString] = operatingTime.split(spliter);

    const startAt = parseTime(
      startAtString === '24:00' ? '23:59' : startAtString,
      'HH:mm',
      now,
    );
    const endedAt = parseTime(endedAtString, 'HH:mm', now);

    if (compareAsc(startAt, now) <= 0 && compareAsc(now, endedAt) < 0) {
      return true;
    } else {
      return false;
    }
  }

  return true;
}

export default function Mart({marts, initialFavoriteNames, nowDate}: Props) {
  return (
    marts && (
      <Grid
        itemType="mart"
        items={marts}
        checkOperating={checkOperating}
        nowDate={nowDate}
        initialFavoriteNames={initialFavoriteNames}
        favoriteStorageKey={'favoriteMarts'}
      />
    )
  );
}

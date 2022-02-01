import React from 'react';
import {compareAsc, parse as parseTime} from 'date-fns';
import Grid from '../components/Grid';
import {getNow} from '../helpers/getNow';
import {getTodaysDate} from '../helpers/getTodaysDate';

type Props = {
  cafes: CafeData[];
  initialFavoriteNames: string[];
};

export type CafeData = {
  name: string;
  contact: string;
  location: string;
  size: string;
  items: string;
  weekday: string;
  saturday: string;
  holiday: string;
};

function checkOperating(cafe: CafeData): boolean {
  const now = getNow();
  const {weekday, saturday, holiday} = cafe;

  const operatingTime = (() => {
    const day = getTodaysDate().day;
    switch (day) {
      case 0: // sunday
        return holiday;
      case 6: // saturday
        return saturday;
      default:
        return weekday;
    }
  })();

  if (
    operatingTime.includes('휴무') ||
    operatingTime.includes('휴관') ||
    operatingTime.includes('휴점') ||
    operatingTime.includes('폐점')
  ) {
    return false;
  }

  if (operatingTime.includes('24시간')) {
    return true;
  }

  if (operatingTime.includes('-') || operatingTime.includes('~')) {
    const spliter = /-|~/;
    const [startAtString, endedAtString] = operatingTime
      .split('(')[0]
      .split(spliter);

    const startAt = parseTime(
      startAtString === '24:00' ? '23:59' : startAtString,
      'HH:mm',
      now,
    );
    const endedAt = parseTime(endedAtString, 'HH:mm', now);

    if (compareAsc(startAt, now) < 0 && compareAsc(now, endedAt) < 0) {
      return true;
    } else {
      return false;
    }
  }

  return true;
}

export default function Cafe({cafes, initialFavoriteNames}: Props) {
  return (
    <Grid
      itemType="cafe"
      items={cafes}
      checkOperating={checkOperating}
      initialFavoriteNames={initialFavoriteNames}
      favoriteStorageKey={'favoriteCafes'}
    />
  );
}

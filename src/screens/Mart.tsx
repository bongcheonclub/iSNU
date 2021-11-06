import React from 'react';
import {compareAsc, getDay, parse as parseTime} from 'date-fns';
import Grid from '../components/Grid';
import {getNow} from '../helpers/getNow';

type Props = {
  marts: MartData[];
  initialFavoriteNames: string[];
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

function checkOperating(mart: MartData): boolean {
  const now = getNow();

  const {weekday, saturday, holiday} = mart;

  const operatingTime = (() => {
    const day = getDay(now);
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

    if (compareAsc(startAt, now) < 0 && compareAsc(now, endedAt) < 0) {
      return true;
    } else {
      return false;
    }
  }

  return true;
}

export default function Mart({marts, initialFavoriteNames}: Props) {
  return (
    marts && (
      <Grid
        itemType="mart"
        items={marts}
        checkOperating={checkOperating}
        initialFavoriteNames={initialFavoriteNames}
        favoriteStorageKey={'favoriteMarts'}
      />
    )
  );
}

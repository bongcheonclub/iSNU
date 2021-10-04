import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import React, {useEffect, useState} from 'react';
import {compareAsc, getDay, parse as parseTime} from 'date-fns';
import Grid from '../components/Grid';
import {ParamListBase} from '@react-navigation/routers';
import {STORAGE_KEY} from '../constants';

type Props = BottomTabScreenProps<ParamListBase, '카페'> & {
  cafes: Cafe[];
  initialFavoriteNames: string[];
};

export type Cafe = {
  name: string;
  contact: string;
  location: string;
  size: string;
  items: string;
  weekday: string;
  saturday: string;
  holiday: string;
};

function checkOperating(cafe: Cafe): boolean {
  const {weekday, saturday, holiday} = cafe;

  const now = new Date();

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

  if (operatingTime.includes('~')) {
    const [startAtString, endedAtString] = operatingTime.split('~');

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

export default function Cafe({navigation, cafes, initialFavoriteNames}: Props) {
  return (
    <Grid
      items={cafes}
      checkOperating={checkOperating}
      initialFavoriteNames={initialFavoriteNames}
      favoriteStorageKey={STORAGE_KEY.favoriteCafe}
    />
  );
}

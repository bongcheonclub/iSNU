import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {chain, find, map} from 'lodash';
import React, {useEffect, useState} from 'react';
import {compareAsc, getDay, parse as parseTime, subDays} from 'date-fns';
import List from '../components/List';
import {ParamListBase} from '@react-navigation/native';
import {FAVORITE_STORAGE_KEY} from '../App';

type Props = BottomTabScreenProps<ParamListBase, '셔틀'> & {
  initialFavoriteNames: string[];
};

export type Shuttle = {
  name: string;
  operatings: {time: string; interval: string; numbers: string}[];
};

const SHUTTLES: Shuttle[] = [
  {
    name: '설입 ↔ 행정관',
    operatings: [
      {
        time: '07:00~08:00',
        interval: '15분',
        numbers: '2대',
      },
      {
        time: '08:00~11:00',
        interval: '3~4분',
        numbers: '9대',
      },
      {
        time: '11:00~15:00',
        interval: '10분',
        numbers: '3대',
      },
      {
        time: '15:00~19:00',
        interval: '3~4분',
        numbers: '9대',
      },
      {
        time: '21:10~23:10',
        interval: '30분',
        numbers: '2대',
      },
    ],
  },
  {
    name: '녹두 ↔ 행정관',
    operatings: [
      {
        time: '07:00~08:00',
        interval: '15분',
        numbers: '1대',
      },
      {
        time: '08:00~11:00',
        interval: '6분',
        numbers: '3대',
      },
      {
        time: '11:00~19:00',
        interval: '10분',
        numbers: '2대',
      },
      {
        time: '21:10~23:10',
        interval: '30분',
        numbers: '2대',
      },
    ],
  },
  {
    name: '사당 ↔ 행정관',
    operatings: [
      {
        time: '08:00~11:00',
        interval: '10분',
        numbers: '4대',
      },
    ],
  },
  {
    name: '설입 → 윗공대',
    operatings: [
      {
        time: '08:00~11:00',
        interval: '6~8분',
        numbers: '5대',
      },
    ],
  },
  {
    name: '낙성대 → 윗공대',
    operatings: [
      {
        time: '08:30~11:00',
        interval: '5분',
        numbers: '7대',
      },
    ],
  },
  {
    name: '교내 순환',
    operatings: [
      {
        time: '08:00~19:00',
        interval: '5~6분',
        numbers: '3~4대',
      },
      {
        time: '19:00~21:00',
        interval: '20분',
        numbers: '1대',
      },
    ],
  },
  {
    name: '교내 역순환',
    operatings: [
      {
        time: '09:50~12:50',
        interval: '20분',
        numbers: '2대',
      },
      {
        time: '13:30~15:10',
        interval: '40~60분',
        numbers: '2대',
      },
      {
        time: '15:30~17:10',
        interval: '20분',
        numbers: '2대',
      },
    ],
  },
  {
    name: '심야 셔틀',
    operatings: [
      {
        time: '24:00~02:00',
        interval: '30분',
        numbers: '1대',
      },
    ],
  },
];

function checkOperating(suttle: Shuttle): {
  isOperating: boolean;
  operating: Shuttle['operatings'][number] | null;
} {
  const {operatings} = suttle;

  const now = new Date();

  const day = getDay(now);

  if (day === 0 || day === 6) {
    return {isOperating: false, operating: null};
  }

  const operating = find(operatings, o => {
    const [startAtString, endedAtString] = o.time.split('~');
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
  });

  if (operating) {
    return {isOperating: true, operating};
  } else {
    return {isOperating: false, operating: null};
  }
}

export default function Shuttle({navigation, initialFavoriteNames}: Props) {
  return (
    <List
      items={SHUTTLES}
      checkOperating={checkOperating}
      initialFavoriteNames={initialFavoriteNames}
      favoriteStorageKey={FAVORITE_STORAGE_KEY.shuttle}
    />
  );
}

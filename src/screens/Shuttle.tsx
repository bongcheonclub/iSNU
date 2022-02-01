import {find} from 'lodash';
import React from 'react';
import {compareAsc, parse as parseTime} from 'date-fns';
import List from '../components/List';
import {getNow} from '../helpers/getNow';
import {isVacation} from '../InitializeData/ProcessVacation';
import {getTodaysDate} from '../helpers/getTodaysDate';

type Props = {
  initialFavoriteNames: string[];
};

export type ShuttleType = {
  name: string;
  operatings: {
    time: string;
    interval: string | null;
    numbers: string | null;
    partition: string;
  }[];
};

const SHUTTLES: ShuttleType[] = [
  {
    name: '설입 ↔ 행정관',
    operatings: [
      {
        time: '00:00~07:00',
        interval: null,
        numbers: null,
        partition: '07:00 운행 예정',
      },
      {
        time: '07:00~08:00',
        interval: '15분',
        numbers: '2대',
        partition: '등교 ~18:00, 하교 ~19:00',
      },
      {
        time: '08:00~11:00',
        interval: '3~4분',
        numbers: '9대',
        partition: '등교 ~18:00, 하교 ~19:00',
      },
      {
        time: '11:00~15:00',
        interval: '10분',
        numbers: '3대',
        partition: '등교 ~18:00, 하교 ~19:00',
      },
      {
        time: '15:00~18:00',
        interval: '3~4분',
        numbers: '9대',
        partition: '등교 ~18:00, 하교 ~19:00',
      },
      {
        time: '18:00~19:00',
        interval: '3~4분\n(하교셔틀만 운영)',
        numbers: '9대',
        partition: '하교 ~19:00',
      },
      {
        time: '19:00~21:10',
        interval: null,
        numbers: null,
        partition: '21:10 운행 예정',
      },
      {
        time: '21:10~23:10',
        interval: '30분',
        numbers: '2대',
        partition: '23:10까지 운행',
      },
      {
        time: '23:10~23:59',
        interval: null,
        numbers: null,
        partition: '운행 종료',
      },
    ],
  },
  {
    name: '녹두 ↔ 행정관',
    operatings: [
      {
        time: '00:00~07:00',
        interval: null,
        numbers: null,
        partition: '07:00 운행 예정',
      },
      {
        time: '07:00~08:00',
        interval: '15분',
        numbers: '1대',
        partition: '등교 ~18:00, 하교 ~19:00',
      },
      {
        time: '08:00~11:00',
        interval: '6분',
        numbers: '3대',
        partition: '등교 ~18:00, 하교 ~19:00',
      },
      {
        time: '11:00~18:00',
        interval: '10분',
        numbers: '2대',
        partition: '등교 ~18:00, 하교 ~19:00',
      },
      {
        time: '18:00~19:00',
        interval: '10분\n(하교셔틀만 운영)',
        numbers: '2대',
        partition: '하교 ~19:00',
      },
      {
        time: '19:00~21:10',
        interval: null,
        numbers: null,
        partition: '21:10 운행 예정',
      },
      {
        time: '21:10~23:10',
        interval: '30분',
        numbers: '2대',
        partition: '23:10까지 운행',
      },
      {
        time: '23:10~23:59',
        interval: null,
        numbers: null,
        partition: '운행 종료',
      },
    ],
  },
  {
    name: '사당 ↔ 행정관',
    operatings: [
      {
        time: '00:00~08:00',
        interval: null,
        numbers: null,
        partition: '08:00 운행 예정',
      },
      {
        time: '08:00~11:00',
        interval: '10분',
        numbers: '4대',
        partition: '11:00까지 운행',
      },
      {
        time: '11:00~23:59',
        interval: null,
        numbers: null,
        partition: '운행 종료',
      },
    ],
  },
  {
    name: '설입 → 윗공대',
    operatings: [
      {
        time: '00:00~08:00',
        interval: null,
        numbers: null,
        partition: '08:00 운행 예정',
      },
      {
        time: '08:00~11:00',
        interval: '6~8분',
        numbers: '5대',
        partition: '11:00까지 운행',
      },
      {
        time: '11:00~23:59',
        interval: null,
        numbers: null,
        partition: '운행 종료',
      },
    ],
  },
  {
    name: '낙성대 → 윗공대',
    operatings: [
      {
        time: '00:00~08:30',
        interval: null,
        numbers: null,
        partition: '08:30 운행 예정',
      },
      {
        time: '08:30~11:00',
        interval: '5분',
        numbers: '7대',
        partition: '11:00까지 운행',
      },
      {
        time: '11:00~23:59',
        interval: null,
        numbers: null,
        partition: '운행 종료',
      },
    ],
  },
  {
    name: '교내 순환',
    operatings: [
      {
        time: '00:00~08:00',
        interval: null,
        numbers: null,
        partition: '08:00 운행 예정',
      },
      {
        time: '08:00~19:00',
        interval: '5~6분',
        numbers: '3~4대',
        partition: '21:00까지 운행',
      },
      {
        time: '19:00~21:00',
        interval: '20분',
        numbers: '1대',
        partition: '21:00까지 운행',
      },
      {
        time: '21:00~23:59',
        interval: null,
        numbers: null,
        partition: '운행 종료',
      },
    ],
  },
  {
    name: '교내 역순환',
    operatings: [
      {
        time: '00:00~09:50',
        interval: null,
        numbers: null,
        partition: '09:50 운행 예정',
      },
      {
        time: '09:50~12:50',
        interval: '20분',
        numbers: '2대',
        partition: '17:10까지 운행',
      },
      {
        time: '12:50~13:30',
        interval: null,
        numbers: null,
        partition: '13:30 운행 예정',
      },
      {
        time: '13:30~15:10',
        interval: '40~60분',
        numbers: '2대',
        partition: '17:10까지 운행',
      },
      {
        time: '15:10~15:30',
        interval: null,
        numbers: null,
        partition: '15:30부터 ',
      },
      {
        time: '15:30~17:10',
        interval: '20분',
        numbers: '2대',
        partition: '17:10까지 운행',
      },
      {
        time: '17:10~23:59',
        interval: null,
        numbers: null,
        partition: '운행 종료',
      },
    ],
  },
  {
    name: '심야 셔틀',
    operatings: [
      {
        time: '00:00~02:00',
        interval: '30분',
        numbers: '1대',
        partition: '02:00까지 운행',
      },
      {
        time: '02:00~18:00',
        interval: null,
        numbers: null,
        partition: '운행 종료',
      },
      {
        time: '18:00~23:59',
        interval: null,
        numbers: null,
        partition: '자정부터 운행 예정',
      },
    ],
  },
];

const SHUTTLES_VACATION: ShuttleType[] = [
  {
    name: '설입 ↔ 행정관',
    operatings: [
      {
        time: '00:00~07:00',
        interval: null,
        numbers: null,
        partition: '07:00 운행 예정',
      },
      {
        time: '07:00~08:00',
        interval: '15분',
        numbers: '2대',
        partition: '등교 ~18:00, 하교 ~19:00',
      },
      {
        time: '08:00~11:00',
        interval: '3~4분',
        numbers: '8대',
        partition: '등교 ~18:00, 하교 ~19:00',
      },
      {
        time: '11:00~15:00',
        interval: '10분',
        numbers: '3대',
        partition: '등교 ~18:00, 하교 ~19:00',
      },
      {
        time: '15:00~18:00',
        interval: '3~4분',
        numbers: '8대',
        partition: '등교 ~18:00, 하교 ~19:00',
      },
      {
        time: '18:00~19:00',
        interval: '3~4분\n(하교셔틀만 운영)',
        numbers: '8대',
        partition: '하교 ~19:00',
      },
      {
        time: '19:00~21:10',
        interval: null,
        numbers: null,
        partition: '21:10 운행 예정',
      },
      {
        time: '21:10~23:10',
        interval: '30분',
        numbers: '2대',
        partition: '23:10까지 운행',
      },
      {
        time: '23:10~23:59',
        interval: null,
        numbers: null,
        partition: '운행 종료',
      },
    ],
  },
  {
    name: '녹두 ↔ 행정관',
    operatings: [
      {
        time: '00:00~07:00',
        interval: null,
        numbers: null,
        partition: '07:00 운행 예정',
      },
      {
        time: '07:00~08:00',
        interval: '15분',
        numbers: '1대',
        partition: '19:00까지 운행',
      },
      {
        time: '08:00~11:00',
        interval: '6분',
        numbers: '3대',
        partition: '19:00까지 운행',
      },
      {
        time: '11:00~19:00',
        interval: '10분',
        numbers: '2대',
        partition: '19:00까지 운행',
      },
      {
        time: '19:00~21:10',
        interval: null,
        numbers: null,
        partition: '21:10 운행 예정',
      },
      {
        time: '21:10~23:10',
        interval: '30분',
        numbers: '2대',
        partition: '23:10까지 운행',
      },
      {
        time: '23:10~23:59',
        interval: null,
        numbers: null,
        partition: '운행 종료',
      },
    ],
  },
  {
    name: '사당 ↔ 행정관',
    operatings: [
      {
        time: '00:00~08:00',
        interval: null,
        numbers: null,
        partition: '08:00 운행 예정',
      },
      {
        time: '08:00~11:00',
        interval: '15분',
        numbers: '3대',
        partition: '11:00까지 운행',
      },
      {
        time: '11:00~23:59',
        interval: null,
        numbers: null,
        partition: '운행 종료',
      },
    ],
  },
  {
    name: '설입 → 윗공대',
    operatings: [
      {
        time: '00:00~23:59',
        interval: null,
        numbers: null,
        partition: '운행 없음',
      },
    ],
  },
  {
    name: '낙성대 → 윗공대',
    operatings: [
      {
        time: '00:00~23:59',
        interval: null,
        numbers: null,
        partition: '운행 없음',
      },
    ],
  },
  {
    name: '교내 순환',
    operatings: [
      {
        time: '00:00~08:00',
        interval: null,
        numbers: null,
        partition: '08:00 운행 예정',
      },
      {
        time: '08:00~18:00',
        interval: '5~6분',
        numbers: '3~4대',
        partition: '18:00까지 운행',
      },
      {
        time: '18:00~23:59',
        interval: null,
        numbers: null,
        partition: '운행 종료',
      },
    ],
  },
  {
    name: '교내 역순환',
    operatings: [
      {
        time: '00:00~09:50',
        interval: null,
        numbers: null,
        partition: '09:50 운행 예정',
      },
      {
        time: '09:50~12:50',
        interval: '20분',
        numbers: '2대',
        partition: '17:10까지 운행',
      },
      {
        time: '12:50~13:30',
        interval: null,
        numbers: null,
        partition: '13:30 운행 예정',
      },
      {
        time: '13:30~15:10',
        interval: '40~60분',
        numbers: '2대',
        partition: '17:10까지 운행',
      },
      {
        time: '15:10~15:30',
        interval: null,
        numbers: null,
        partition: '15:30부터 운행',
      },
      {
        time: '15:30~17:10',
        interval: '20분',
        numbers: '2대',
        partition: '17:10까지 운행',
      },
      {
        time: '17:10~23:59',
        interval: null,
        numbers: null,
        partition: '운행 종료',
      },
    ],
  },
  {
    name: '심야 셔틀',
    operatings: [
      {
        time: '00:00~23:59',
        interval: null,
        numbers: null,
        partition: '운행 없음',
      },
    ],
  },
];

const SHUTTLES_AFTER_VACATION: ShuttleType[] = [
  {
    name: '설입 ↔ 행정관',
    operatings: [
      {
        time: '00:00~08:00',
        interval: null,
        numbers: null,
        partition: '08:00 운행 예정',
      },
      {
        time: '08:00~11:00',
        interval: '3~4분',
        numbers: '7대',
        partition: '등교 ~18:00, 하교 ~19:00',
      },
      {
        time: '11:00~15:00',
        interval: '10분',
        numbers: '3대',
        partition: '등교 ~18:00, 하교 ~19:00',
      },
      {
        time: '15:00~18:00',
        interval: '3~4분',
        numbers: '7대',
        partition: '등교 ~18:00, 하교 ~19:00',
      },
      {
        time: '18:00~19:00',
        interval: '3~4분\n(하교셔틀만 운영)',
        numbers: '7대',
        partition: '하교 ~19:00',
      },
      {
        time: '19:00~21:10',
        interval: null,
        numbers: null,
        partition: '21:10 운행 예정',
      },
      {
        time: '21:10~23:10',
        interval: '30분',
        numbers: '2대',
        partition: '23:10까지 운행',
      },
      {
        time: '23:10~23:59',
        interval: null,
        numbers: null,
        partition: '운행 종료',
      },
    ],
  },
  {
    name: '녹두 ↔ 행정관',
    operatings: [
      {
        time: '00:00~08:00',
        interval: null,
        numbers: null,
        partition: '08:00 운행 예정',
      },
      {
        time: '08:00~09:00',
        interval: '10~12분',
        numbers: '2대',
        partition: '9:00까지 운행',
      },
      {
        time: '09:00~21:10',
        interval: null,
        numbers: null,
        partition: '21:10 운행 예정',
      },
      {
        time: '21:10~23:10',
        interval: '30분',
        numbers: '1대',
        partition: '23:10까지 운행',
      },
      {
        time: '23:10~23:59',
        interval: null,
        numbers: null,
        partition: '운행 종료',
      },
    ],
  },
  {
    name: '사당 ↔ 행정관',
    operatings: [
      {
        time: '00:00~08:00',
        interval: null,
        numbers: null,
        partition: '08:00 운행 예정',
      },
      {
        time: '08:00~11:00',
        interval: '15분',
        numbers: '3대',
        partition: '11:00까지 운행',
      },
      {
        time: '11:00~23:59',
        interval: null,
        numbers: null,
        partition: '운행 종료',
      },
    ],
  },
  {
    name: '설입 → 윗공대',
    operatings: [
      {
        time: '00:00~23:59',
        interval: null,
        numbers: null,
        partition: '운행 없음',
      },
    ],
  },
  {
    name: '낙성대 → 윗공대',
    operatings: [
      {
        time: '00:00~23:59',
        interval: null,
        numbers: null,
        partition: '운행 없음',
      },
    ],
  },
  {
    name: '교내 순환',
    operatings: [
      {
        time: '00:00~08:00',
        interval: null,
        numbers: null,
        partition: '08:00 운행 예정',
      },
      {
        time: '08:00~18:00',
        interval: '10분',
        numbers: '2대',
        partition: '18:00까지 운행',
      },
      {
        time: '18:00~23:59',
        interval: null,
        numbers: null,
        partition: '운행 종료',
      },
    ],
  },
  {
    name: '교내 역순환',
    operatings: [
      {
        time: '00:00~09:50',
        interval: null,
        numbers: null,
        partition: '09:50 운행 예정',
      },
      {
        time: '09:50~12:50',
        interval: '20분',
        numbers: '2대',
        partition: '17:10까지 운행',
      },
      {
        time: '12:50~13:30',
        interval: null,
        numbers: null,
        partition: '13:30 운행 예정',
      },
      {
        time: '13:30~15:10',
        interval: '40~60분',
        numbers: '2대',
        partition: '17:10까지 운행',
      },
      {
        time: '15:10~15:30',
        interval: null,
        numbers: null,
        partition: '15:30부터 운행',
      },
      {
        time: '15:30~17:10',
        interval: '20분',
        numbers: '2대',
        partition: '17:10까지 운행',
      },
      {
        time: '17:10~23:59',
        interval: null,
        numbers: null,
        partition: '운행 종료',
      },
    ],
  },
  {
    name: '심야 셔틀',
    operatings: [
      {
        time: '00:00~23:59',
        interval: null,
        numbers: null,
        partition: '운행 없음',
      },
    ],
  },
];

function checkOperating(shuttle: ShuttleType):
  | {
      isOperating: true;
      operating: ShuttleType['operatings'][number];
    }
  | {isOperating: false; operating: ShuttleType['operatings'][number] | null} {
  const now = getNow();
  const {operatings} = shuttle;
  const day = getTodaysDate().isHoliday ? 0 : getTodaysDate().day;

  if (!shuttle.name.includes('심야') && (day === 0 || day === 6)) {
    return {isOperating: false, operating: null};
  }
  if (shuttle.name.includes('심야')) {
    // 00:00 ~ 02:00 심야셔틀이 운행 안하는 요일은 일요일, 월요일 새벽
    // 다음날 심야셔틀이 운행 안하는 요일은 토요일, 일요일
    if (
      compareAsc(now, parseTime('02:00', 'HH:mm', now)) < 0 &&
      (day === 0 || day === 1)
    ) {
      return {isOperating: false, operating: null};
    } else if (day === 0 || day === 6) {
      return {isOperating: false, operating: null};
    }
  }

  const operating = find(operatings, o => {
    const [startAtString, endedAtString] = o.time.split('~');
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
  });

  if (operating && operating.interval != null) {
    return {isOperating: true, operating};
  } else {
    return {isOperating: false, operating: operating ?? null};
  }
}

export default function Shuttle({initialFavoriteNames}: Props) {
  if (isVacation() === true) {
    return (
      <List
        itemType="shuttle"
        items={SHUTTLES_VACATION}
        checkOperating={checkOperating}
        initialFavoriteNames={initialFavoriteNames}
        favoriteStorageKey={'favoriteShuttles'}
      />
    );
  } else if (isVacation() === false) {
    return (
      <List
        itemType="shuttle"
        items={SHUTTLES}
        checkOperating={checkOperating}
        initialFavoriteNames={initialFavoriteNames}
        favoriteStorageKey={'favoriteShuttles'}
      />
    );
  } else {
    return (
      <List
        itemType="shuttle"
        items={SHUTTLES_AFTER_VACATION}
        checkOperating={checkOperating}
        initialFavoriteNames={initialFavoriteNames}
        favoriteStorageKey={'favoriteShuttles'}
      />
    );
  }
}

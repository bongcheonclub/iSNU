import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import axios from 'axios';
import {chain, map} from 'lodash';
import {parse} from 'node-html-parser';
import {
  Box,
  Center,
  HStack,
  ScrollView,
  Text,
  VStack,
  Button,
  Modal,
} from 'native-base';
import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {RootTabList} from '../App';
import {compareAsc, getDay, parse as parseTime} from 'date-fns';
import {compareDesc} from 'date-fns/esm';
import Grid from '../components/Grid';

type Props = BottomTabScreenProps<RootTabList, 'Mart'>;

export type Mart = {
  name: string;
  location: string;
  items: string;
  weekday: string;
  saturday: string;
  holiday: string;
  contact: string;
};

function checkOperating(mart: Mart): boolean {
  const {weekday, saturday, holiday} = mart;

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

  if (operatingTime === '휴무') {
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

export default function Mart({navigation}: Props) {
  const [marts, setMarts] = useState<Mart[] | null>(null);

  useEffect(() => {
    axios.get('https://snuco.snu.ac.kr/ko/node/19').then(res => {
      const html = res.data;
      const root = parse(html);
      const data: Mart[] = chain(root.querySelector('tbody').childNodes)
        .map(trNode => {
          const trTexts = chain(trNode.childNodes)
            .map(tdNode =>
              tdNode.innerText
                .split(/\s|\t|\n/)
                .filter(item => item.length > 0)
                .join(' '),
            )
            .filter(rows => rows.length > 0)
            .value();
          const [name, location, items, weekday, saturday, holiday, contact] =
            trTexts;
          return {
            name,
            location,
            items,
            weekday,
            saturday,
            holiday,
            contact,
          };
        })
        .value();
      setMarts(data);
    });
  }, []);
  return marts && <Grid items={marts} checkOperating={checkOperating} />;
}

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
  Flex,
  Divider,
} from 'native-base';
import FilledStar from '../icons/filled-star.svg';
import UnfilledStar from '../icons/unfilled-star.svg';
import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {RootTabList} from '../App';
import {compareAsc, getDay, parse as parseTime} from 'date-fns';
import {compareDesc} from 'date-fns/esm';
import {colors} from '../ui/colors';
import Grid from '../components/Grid';

type Props = BottomTabScreenProps<RootTabList, 'Cafe'>;

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

type CafeWithFlag = Cafe & {isOperating: boolean; favorateRate: number};

function checkOperating(mart: Cafe): boolean {
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

export default function Cafe({navigation}: Props) {
  const [cafes, setCafes] = useState<Cafe[] | null>(null);

  useEffect(() => {
    axios.get('https://snuco.snu.ac.kr/ko/node/21').then(res => {
      const html = res.data;
      const root = parse(html);
      const data: Cafe[] = chain(root.querySelector('tbody').childNodes)
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
          const [
            nameWithContact,
            location,
            size,
            items,
            weekday,
            saturday,
            holiday,
          ] = trTexts;
          const [name, contact] = nameWithContact.split(/\(|\)/);
          return {
            name,
            contact,
            location,
            size,
            items,
            weekday,
            saturday,
            holiday,
          };
        })
        .value();
      setCafes(data);
    });
  }, []);

  return cafes && <Grid items={cafes} checkOperating={checkOperating} />;
}

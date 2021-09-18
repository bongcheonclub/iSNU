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
import {compareAsc, getDay, parse as parseTime, subDays} from 'date-fns';

type Props = BottomTabScreenProps<RootTabList, 'Shuttle'>;

// todo : 승차지점
type Shuttle = {
  name: string;
  operatings: {time: string; inteval: string; numbers: string}[];
};

const SHUTTLES: Shuttle[] = [
  {
    name: '행정관 ↔ 서울대입구역',
    operatings: [
      {
        time: '07:00~08:00',
        inteval: '15분',
        numbers: '2대',
      },
      {
        time: '08:00~11:00',
        inteval: '3~4분',
        numbers: '9대',
      },
      {
        time: '11:00~15:00',
        inteval: '10분',
        numbers: '3대',
      },
      {
        time: '15:00~19:00',
        inteval: '3~4분',
        numbers: '9대',
      },
      {
        time: '21:10~23:10',
        inteval: '30분',
        numbers: '2대',
      },
    ],
  },
  {
    name: '행정관 ↔ 대학동',
    operatings: [
      {
        time: '07:00~08:00',
        inteval: '15분',
        numbers: '1대',
      },
      {
        time: '08:00~11:00',
        inteval: '6분',
        numbers: '3대',
      },
      {
        time: '11:00~19:00',
        inteval: '10분',
        numbers: '2대',
      },
      {
        time: '21:10~23:10',
        inteval: '30분',
        numbers: '2대',
      },
    ],
  },
  {
    name: '사당역 ↔ 행정관',
    operatings: [
      {
        time: '08:00~11:00',
        inteval: '10분',
        numbers: '4대',
      },
    ],
  },
  {
    name: '서울대입구역 → 윗공대',
    operatings: [
      {
        time: '08:00~11:00',
        inteval: '6~8분',
        numbers: '5대',
      },
    ],
  },
  {
    name: '낙성대 → 윗공대',
    operatings: [
      {
        time: '08:30~11:00',
        inteval: '5분',
        numbers: '7대',
      },
    ],
  },
  {
    name: '교내순환',
    operatings: [
      {
        time: '08:00~19:00',
        inteval: '5~6분',
        numbers: '3~4대',
      },
      {
        time: '19:00~21:00',
        inteval: '20분',
        numbers: '1대',
      },
    ],
  },
  {
    name: '교내순환 역방향',
    operatings: [
      {
        time: '09:50~12:50',
        inteval: '20분',
        numbers: '2대',
      },
      {
        time: '13:30~15:10',
        inteval: '40~60분',
        numbers: '2대',
      },
      {
        time: '15:30~17:10',
        inteval: '20분',
        numbers: '2대',
      },
    ],
  },
  {
    name: '심야 셔틀',
    operatings: [
      {
        time: '24:00~02:00',
        inteval: '30분',
        numbers: '1대',
      },
    ],
  },
];

function checkOperating(suttle: Shuttle): boolean {
  const {operatings} = suttle;

  const now = new Date();

  const day = getDay(now);

  if (day === 0 || day === 6) {
    return false;
  }

  const isOperating = chain(operatings)
    .map(operating => {
      const [startAtString, endedAtString] = operating.time.split('~');
      const startAt = parseTime(
        startAtString === '24:00' ? '23:59' : startAtString,
        'HH:mm',
        now,
      );
      const endedAt = parseTime(endedAtString, 'HH:mm', now);

      if (compareAsc(startAt, now) < 0 && compareAsc(now, endedAt) < 0) {
        return true;
      } else {
        console.log(startAt, now, endedAt);
        return false;
      }
    })
    .some()
    .value();

  return isOperating;
}

export default function Shuttle({navigation}: Props) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const focusedShuttle = focusedIndex !== null && SHUTTLES[focusedIndex];

  return (
    <Box>
      <Box>
        <ScrollView>
          <VStack>
            {SHUTTLES.map((mart, index) => {
              const {name} = mart;
              const bgColor = checkOperating(mart) ? '#005500' : '#AAAAAA';

              return (
                <Center margin={1} rounded="md" shadow={3}>
                  <Button
                    onPress={() => setFocusedIndex(index)}
                    width="100%"
                    bgColor={bgColor}>
                    <Text color="white">{name}</Text>
                  </Button>
                </Center>
              );
            })}
          </VStack>
        </ScrollView>
        {focusedShuttle ? (
          <Box>
            <Modal
              isOpen={focusedIndex !== null}
              onClose={() => setFocusedIndex(null)}>
              <Modal.Content>
                <Modal.CloseButton />
                <Modal.Body>
                  <Text>운행 구간: {focusedShuttle.name}</Text>
                  {focusedShuttle.operatings.map(opearting => (
                    <Box>
                      <Text>운행 시간: {opearting.time}</Text>
                      <Text>배차: {opearting.inteval}</Text>
                      <Text>대수: {opearting.numbers}</Text>
                    </Box>
                  ))}
                </Modal.Body>
              </Modal.Content>
            </Modal>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

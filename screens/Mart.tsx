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

type Props = BottomTabScreenProps<RootTabList, 'Mart'>;

type Mart = {
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

  if (operatingTime === '휴뮤') {
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

    if (compareAsc(startAt, now) > 0 && compareAsc(now, endedAt) > 0) {
      return true;
    } else {
      return false;
    }
  }

  return true;
}

export default function Mart({navigation}: Props) {
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [marts, setMarts] = useState<Mart[] | null>(null);

  const focusedMart = detailIndex !== null && marts?.[detailIndex];

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
  });
  return (
    <Box>
      {marts ? (
        <Box>
          <ScrollView>
            <VStack>
              {marts.map((mart, index) => {
                const {name} = mart;
                const bgColor = checkOperating(mart) ? '#005500' : '#AAAAAA';

                return (
                  <Center margin={1} rounded="md" shadow={3}>
                    <Button
                      onPress={() => setDetailIndex(index)}
                      width="100%"
                      bgColor={bgColor}>
                      <Text color="white">{name}</Text>
                    </Button>
                  </Center>
                );
              })}
            </VStack>
          </ScrollView>
          {focusedMart ? (
            <Box>
              <Modal
                isOpen={detailIndex !== null}
                onClose={() => setDetailIndex(null)}>
                <Modal.Content>
                  <Modal.CloseButton />
                  <Modal.Body>
                    <Text>매장: {focusedMart.name}</Text>
                    <Text>위치: {focusedMart.location}</Text>
                    <Text>주요 품목: {focusedMart.items}</Text>
                    <Text>평일 운영 시간: {focusedMart.weekday}</Text>
                    <Text>토요일 운영 시간: {focusedMart.saturday}</Text>
                    <Text>휴일 운영 시간: {focusedMart.holiday}</Text>
                    <Text>연락처: {focusedMart.holiday}</Text>
                  </Modal.Body>
                </Modal.Content>
              </Modal>
            </Box>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}

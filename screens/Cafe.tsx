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

type Props = BottomTabScreenProps<RootTabList, 'Cafe'>;

type Cafe = {
  name: string;
  location: string;
  size: string;
  items: string;
  weekday: string;
  saturday: string;
  holiday: string;
};

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
    operatingTime.includes('휴뮤') ||
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
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [cafes, setCafes] = useState<Cafe[] | null>(null);

  const focusedCafe = focusedIndex !== null && cafes?.[focusedIndex];

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
          const [name, location, size, items, weekday, saturday, holiday] =
            trTexts;
          console.log(trTexts);
          return {
            name,
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
  });
  return (
    <Box>
      {cafes ? (
        <Box>
          <ScrollView>
            <VStack>
              {cafes.map((mart, index) => {
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
          {focusedCafe ? (
            <Box>
              <Modal
                isOpen={focusedIndex !== null}
                onClose={() => setFocusedIndex(null)}>
                <Modal.Content>
                  <Modal.CloseButton />
                  <Modal.Body>
                    <Text>매장: {focusedCafe.name}</Text>
                    <Text>위치: {focusedCafe.location}</Text>
                    <Text>주요 품목: {focusedCafe.items}</Text>
                    <Text>평일 운영 시간: {focusedCafe.weekday}</Text>
                    <Text>토요일 운영 시간: {focusedCafe.saturday}</Text>
                    <Text>휴일 운영 시간: {focusedCafe.holiday}</Text>
                    <Text>연락처: {focusedCafe.holiday}</Text>
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

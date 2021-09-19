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

type Props = BottomTabScreenProps<RootTabList, 'Cafe'>;

type Cafe = {
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
  const [focusedName, setFocusedName] = useState<string | null>(null);
  const [cafes, setCafes] = useState<Cafe[] | null>(null);
  const [favoriteNames, setFavoriteNames] = useState<string[]>([]);

  const sortedCafes: CafeWithFlag[] = chain(cafes)
    .map(cafe => {
      const isOperating = checkOperating(cafe);
      const favorateRate =
        favoriteNames.findIndex(name => name === cafe.name) + 1;
      return {...cafe, isOperating, favorateRate};
    })
    .sortBy(({isOperating, favorateRate}) => {
      if (favorateRate > 0) {
        return favorateRate;
      } else if (isOperating) {
        return 100;
      } else {
        return 200;
      }
    })
    .value();

  const focusedCafe =
    focusedName !== null && sortedCafes?.find(({name}) => name === focusedName);

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

  return (
    <Box>
      {sortedCafes ? (
        <Box>
          <ScrollView>
            <VStack padding={8}>
              {chain(sortedCafes)
                .chunk(3)
                .map(cafesInARow =>
                  cafesInARow.length < 3
                    ? (cafesInARow.concat(
                        Array(3 - cafesInARow.length).fill(null),
                      ) as (CafeWithFlag | null)[])
                    : cafesInARow,
                )
                .map(cafesInARow => {
                  return (
                    <Flex height={90} marginY={2} direction="row">
                      {cafesInARow.map(cafe => {
                        if (!cafe) {
                          return <Box marginX={2} flex={1} height="100%" />;
                        }
                        const {name, isOperating, favorateRate} = cafe;

                        return (
                          <Box
                            marginX={2}
                            borderRadius={8}
                            flex={1}
                            height="100%"
                            padding={0}
                            bgColor={
                              favorateRate > 0
                                ? colors.bage[100]
                                : colors.grey[100]
                            }>
                            <Button
                              height="100%"
                              width="100%"
                              bgColor="transparent"
                              onPress={() => setFocusedName(cafe.name)}>
                              <Text
                                color={
                                  favorateRate > 0
                                    ? colors.bage[200]
                                    : colors.grey[400]
                                }>
                                {name}
                              </Text>
                            </Button>
                            <Box
                              position="absolute"
                              top={2}
                              right={2}
                              borderRadius={4}
                              bgColor={isOperating ? colors.green : colors.red}
                              width={2}
                              height={2}
                            />
                          </Box>
                        );
                      })}
                    </Flex>
                  );
                })
                .value()}
            </VStack>
          </ScrollView>
          {focusedCafe ? (
            <Modal
              isOpen={focusedName !== null}
              onClose={() => setFocusedName(null)}>
              <Modal.Content>
                <Modal.Header>
                  <Flex direction="row">
                    <Text color={colors.blue}>{focusedCafe.name}</Text>
                    <Button
                      bgColor="transparent"
                      onPress={() => {
                        setFavoriteNames(prev => {
                          if (prev.find(name => name === focusedCafe.name)) {
                            return prev.filter(
                              name => name !== focusedCafe.name,
                            );
                          } else {
                            return prev.concat(focusedCafe.name);
                          }
                        });
                      }}>
                      {focusedCafe.favorateRate > 0 ? (
                        <FilledStar />
                      ) : (
                        <UnfilledStar />
                      )}
                    </Button>
                  </Flex>
                  <Text color={colors.grey[300]}>{focusedCafe.location}</Text>
                </Modal.Header>
                <Modal.CloseButton />
                <Modal.Body>
                  <Flex direction="row">
                    <Center flex={1}>평일</Center>
                    <Center flex={1}>{focusedCafe.weekday}</Center>
                  </Flex>
                  <Divider bgColor={colors.black} />
                  <Flex direction="row">
                    <Center flex={1}>토요일</Center>
                    <Center flex={1}>{focusedCafe.saturday}</Center>
                  </Flex>
                  <Divider bgColor={colors.black} />
                  <Flex direction="row">
                    <Center flex={1}>휴일</Center>
                    <Center flex={1}>{focusedCafe.holiday}</Center>
                  </Flex>
                </Modal.Body>
              </Modal.Content>
            </Modal>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}

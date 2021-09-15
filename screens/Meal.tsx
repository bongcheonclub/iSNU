import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {RootTabList} from '../App';
import {Box, Center, HStack, ScrollView, Text, VStack} from 'native-base';
import _ from 'lodash';

type Props = BottomTabScreenProps<RootTabList, 'Meal'>;

export default function Meal({navigation}: Props) {
  // todo
  //   const favoritedNumbers = DUMMY_MEAL_INFO.map(({isFavorited}) =>
  //     Number(isFavorited),
  //   ).reduce((sum, currValue) => sum + currValue);
  //   const notFavoritedNumbers = DUMMY_MEAL_INFO.length - favoritedNumbers;
  return (
    <VStack>
      <ScrollView>
        {/* <Text>{DUMMY_MEAL_INFO.length}</Text> */}
        <Center>
          {DUMMY_MEAL_INFO.filter(item => item.isFavorited)
            .sort((a, b) => Number(b.isOperating) - Number(a.isOperating))
            .map(
              ({name, location, isOperating, isFavorited, operatingTime}) => {
                return (
                  <Center
                    width="90%"
                    height="120px"
                    bg="white"
                    rounded="md"
                    marginTop={3}
                    shadow={5}>
                    <Center
                      width="100%"
                      height="40px"
                      position="absolute"
                      top="0px"
                      marginBottom={30}
                      bg={isOperating ? '#F7E600' : 'black'}
                      rounded="md"
                      shadow={2}
                      key={name}>
                      <Text color={isOperating ? '#3A1D1D' : 'white'}>
                        {name}
                      </Text>
                    </Center>
                    <Text>Menu</Text>
                  </Center>
                );
              },
            )}
        </Center>

        <Center marginTop={3}>
          <VStack>
            {_.chunk(
              DUMMY_MEAL_INFO.filter(item => !item.isFavorited).sort(
                (a, b) => Number(b.isOperating) - Number(a.isOperating),
              ),
              3,
            ).map(subMealInfoArray => {
              return (
                <HStack>
                  {subMealInfoArray.map(
                    ({
                      name,
                      location,
                      isOperating,
                      isFavorited,
                      operatingTime,
                    }) => {
                      return (
                        <HStack>
                          <Center
                            width="100px"
                            height="50px"
                            margin={2}
                            bg={isOperating ? '#F7E600' : 'black'}
                            rounded="md"
                            shadow={5}
                            key={name}>
                            <Text color={isOperating ? '#3A1D1D' : 'white'}>
                              {name}
                            </Text>
                          </Center>
                        </HStack>
                      );
                    },
                  )}
                </HStack>
              );
            })}
          </VStack>
          {/* {DUMMY_MEAL_INFO.map(
            ({name, location, isOperating, isFavorited, operatingTime}) => {
              if (!isFavorited) {
                return (
                  <Center
                    width="100px"
                    height="50px"
                    margin={2}
                    bg={isOperating ? '#F7E600' : 'black'}
                    rounded="md"
                    shadow={5}
                    key={name}>
                    <Text color={isOperating ? '#3A1D1D' : 'white'}>
                      {name}
                    </Text>
                  </Center>
                );
              } else {
                return;
              }
            },
          )} */}
        </Center>
      </ScrollView>
    </VStack>
  );
}

const style = StyleSheet.create({
  // todo
});

const DUMMY_MEAL_INFO: {
  name: string;
  location: string;
  isOperating: boolean;
  isFavorited: boolean;
  operatingTime: string;
}[] = [
  {
    name: '학생회관식당',
    location: '학생회관(63동) 1층',
    isOperating: true,
    isFavorited: false,
    operatingTime: '운영중 19:30 종료',
  },
  {
    name: '자하연식당',
    location: '학생회관(63동) 2층',
    isOperating: true,
    isFavorited: false,
    operatingTime: '운영중 18:30 종료',
  },
  {
    name: '예술계식당',
    location: '중도(62동) 3층',
    isOperating: true,
    isFavorited: false,
    operatingTime: '운영중 22:00 종료',
  },
  {
    name: '소담마루',
    location: '중도(62동) 3층',
    isOperating: true,
    isFavorited: false,
    operatingTime: '운영중 22:00 종료',
  },
  {
    name: '두레미담',
    location: '중도(62동) 3층',
    isOperating: true,
    isFavorited: false,
    operatingTime: '운영중 22:00 종료',
  },
  {
    name: '동원관식당',
    location: '중도(62동) 3층',
    isOperating: false,
    isFavorited: false,
    operatingTime: '운영중 22:00 종료',
  },
  {
    name: '기숙사식당',
    location: '중도(62동) 3층',
    isOperating: true,
    isFavorited: false,
    operatingTime: '운영중 22:00 종료',
  },
  {
    name: '공대간이식당',
    location: '중도(62동) 3층',
    isOperating: false,
    isFavorited: false,
    operatingTime: '운영중 22:00 종료',
  },
  {
    name: '즐찾1',
    location: '중도(62동) 3층',
    isOperating: true,
    isFavorited: true,
    operatingTime: '운영중 22:00 종료',
  },
  {
    name: '즐찾2',
    location: '중도(62동) 3층',
    isOperating: false,
    isFavorited: true,
    operatingTime: '운영중 22:00 종료',
  },
  {
    name: '즐찾3',
    location: '중도(62동) 3층',
    isOperating: true,
    isFavorited: true,
    operatingTime: '운영중 22:00 종료',
  },
];

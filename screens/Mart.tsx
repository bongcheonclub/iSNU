import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {Box, Center, HStack, ScrollView, Text, VStack} from 'native-base';
import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {RootTabList} from '../App';

type Props = BottomTabScreenProps<RootTabList, 'Mart'>;

const DUMMY_MART_INFO: {
  name: string;
  location: string;
  operatingTime: string;
}[] = [
  {
    name: '학생회관 매점',
    location: '학생회관(63동) 1층',
    operatingTime: '운영중 19:30 종료',
  },
  {
    name: '학생회관 문구점',
    location: '학생회관(63동) 2층',
    operatingTime: '운영중 18:30 종료',
  },
  {
    name: '중도 CU',
    location: '중도(62동) 3층',
    operatingTime: '운영중 22:00 종료',
  },
  {
    name: '학생회관 매점',
    location: '학생회관(63동) 1층',
    operatingTime: '운영중 19:30 종료',
  },
  {
    name: '학생회관 문구점',
    location: '학생회관(63동) 2층',
    operatingTime: '운영중 18:30 종료',
  },
  {
    name: '중도 CU',
    location: '중도(62동) 3층',
    operatingTime: '운영중 22:00 종료',
  },
  {
    name: '학생회관 매점',
    location: '학생회관(63동) 1층',
    operatingTime: '운영중 19:30 종료',
  },
  {
    name: '학생회관 문구점',
    location: '학생회관(63동) 2층',
    operatingTime: '운영중 18:30 종료',
  },
  {
    name: '중도 CU',
    location: '중도(62동) 3층',
    operatingTime: '운영중 22:00 종료',
  },
  {
    name: '학생회관 매점',
    location: '학생회관(63동) 1층',
    operatingTime: '운영중 19:30 종료',
  },
  {
    name: '학생회관 문구점',
    location: '학생회관(63동) 2층',
    operatingTime: '운영중 18:30 종료',
  },
  {
    name: '중도 CU',
    location: '중도(62동) 3층',
    operatingTime: '운영중 22:00 종료',
  },
];

export default function Mart({navigation}: Props) {
  return (
    <ScrollView>
      <VStack>
        {DUMMY_MART_INFO.map(({name, location, operatingTime}) => (
          <Center margin={1} bg="#333333" rounded="md" shadow={3}>
            <Text color="white">{name}</Text>
            <Text color="white">{location}</Text>
            <Text color="white">{operatingTime}</Text>
          </Center>
        ))}
      </VStack>
    </ScrollView>
  );
}

const style = StyleSheet.create({
  // todo
});

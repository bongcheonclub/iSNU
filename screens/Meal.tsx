import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import React, {useState, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {RootTabList} from '../App';
import {
  Box,
  Center,
  HStack,
  ScrollView,
  Text,
  VStack,
  Modal,
  Button,
} from 'native-base';
import _, {size} from 'lodash';
import axios from 'axios';
import {parse} from 'node-html-parser';

type Props = BottomTabScreenProps<RootTabList, 'Meal'>;

export default function Meal({navigation}: Props) {
  type TodaysMenu = {
    [name: string]: {
      breakfast: string;
      lunch: string;
      dinner: string;
      contact: string;
    };
  } | null;
  // 식당 리스트 정렬
  const [favoriteMeal, notFavoriteMeal] = _.partition(
    DUMMY_MEAL_INFO,
    item => item.isFavorited,
  ); // 즐겨찾기와 나머지 구분
  favoriteMeal.sort((a, b) => Number(b.isOperating) - Number(a.isOperating)); // 즐겨찾기 중 운영 중인 곳 맨 위로
  notFavoriteMeal.sort((a, b) => Number(b.isOperating) - Number(a.isOperating)); // 즐겨찾기 아닌 식당 중 운영 중인 곳 맨 위로

  // 모달 관련
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [menu, setMenu] = useState<TodaysMenu>(null);
  const exampleDateURL =
    'https://snuco.snu.ac.kr/ko/foodmenu?field_menu_date_value_1%5Bvalue%5D%5Bdate%5D=&field_menu_date_value%5Bvalue%5D%5Bdate%5D=09%2F23%2F2021';
  const todayMenuURL = 'https://snuco.snu.ac.kr/ko/foodmenu'; // 정보 받아와서 리스트에 저장, 각 식당의 리스트 인덱스 따로 저장
  useEffect(() => {
    axios.get(exampleDateURL).then(res => {
      const html = res.data;
      const root = parse(html);
      const data: TodaysMenu = {};
      _.chain(root.querySelector('tbody').childNodes)
        .map(trNode => {
          const trTexts = _.chain(trNode.childNodes)
            .map((tdNode, idx) =>
              tdNode.innerText
                .split(/\s|\t|\n/)
                .filter(item => item.length > 0)
                .join(' '),
            )
            .value();
          return trTexts;
        })
        .filter(trTexts => trTexts.length > 0)
        .forEach((trTexts, idx) => {
          const [a, nameAndContact, c, breakfast, e, lunch, g, dinner] =
            trTexts;
          const splitedNameAndContact = _.split(nameAndContact, '(');
          const name = splitedNameAndContact[0];
          const contact = splitedNameAndContact[1].slice(0, -1);
          data[name] = {breakfast, lunch, dinner, contact};
        })
        .value();
      setMenu(data);
    });
  });

  return (
    <VStack>
      <ScrollView>
        <Center>
          {favoriteMeal.map(({name, location, isOperating, operatingTime}) => (
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
                <Text color={isOperating ? '#3A1D1D' : 'white'}>{name}</Text>
              </Center>
              <Text>Menu</Text>
            </Center>
          ))}
        </Center>

        <Center marginTop={3}>
          <VStack>
            {_.chunk(notFavoriteMeal, 3).map(subNotFavoriteMealInfoArray => {
              // not favorite meal 3줄로 나누기
              return (
                <HStack>
                  {subNotFavoriteMealInfoArray.map(
                    ({
                      name,
                      location,
                      isOperating,
                      isFavorited,
                      operatingTime,
                    }) => {
                      return (
                        <HStack>
                          <Button
                            onPress={() => setSelectedMeal(name)}
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
                          </Button>
                        </HStack>
                      );
                    },
                  )}
                </HStack>
              );
            })}
          </VStack>
        </Center>
        <Modal // modal 구현
          isOpen={selectedMeal !== null}
          onClose={() => setSelectedMeal(null)}>
          <Modal.Content>
            <Modal.CloseButton />
            <Modal.Body>
              <Text>{JSON.stringify(menu)}</Text>
              {/* <Text>매장: {focusedMart.name}</Text>
                    <Text>위치: {focusedMart.location}</Text>
                    <Text>평일 운영 시간: {focusedMart.weekday}</Text>
                    <Text>토요일 운영 시간: {focusedMart.saturday}</Text>
                    <Text>휴일 운영 시간: {focusedMart.holiday}</Text>
                    <Text>연락처: {focusedMart.holiday}</Text> */}
            </Modal.Body>
          </Modal.Content>
        </Modal>
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

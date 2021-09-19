import AsyncStorage from '@react-native-async-storage/async-storage';
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
import _, {size, chain, split, partition, chunk, cloneDeep} from 'lodash';
import axios from 'axios';
import {parse} from 'node-html-parser';

function replaceAll(str: string, searchStr: string, replaceStr: string) {
  return str.split(searchStr).join(replaceStr);
}

type Props = BottomTabScreenProps<RootTabList, 'Meal'>;
const mealList = [
  '학생회관식당',
  '자하연식당',
  '예술계식당',
  '소담마루',
  '동원관식당',
  '기숙사식당',
  '공대간이식당',
  '3식당',
  '302동식당',
  '301동식당',
  '220동식당',
];

type Cafeteria = {
  nameAndContact: string;
  location: string;
  floors: string;
  scale: string;
  customer: string;
  weekday: string;
  saturday: string;
  holiday: string;
};

export default function Meal({navigation}: Props) {
  type TodaysMenu = {
    [name: string]: {
      breakfast: string;
      lunch: string;
      dinner: string;
      contact: string;
    };
  };
  const initFavoriteState = {
    학생회관식당: 'false',
    자하연식당: 'false',
    예술계식당: 'false',
    소담마루: 'false',
    동원관식당: 'false',
    기숙사식당: 'false',
    공대간이식당: 'false',
    '3식당': 'false',
    '302동식당': 'false',
    '301동식당': 'false',
    '220동식당': 'false',
  };

  // state 선언
  const [menu, setMenu] = useState<TodaysMenu | null>(null); // store menu data here
  const [isFavorite, setIsFavorite] =
    useState<Record<string, string>>(initFavoriteState); // store favorite or not here
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null); // store selected meal (modal) here

  // 즐겨찾기 여부(storage) 가져오기
  useEffect(() => {
    async function makeFavoriteInitStates() {
      const tempData = await Promise.all(
        mealList.map(async mealName => {
          const key = mealName + 'IsFavorite';
          const val = await AsyncStorage.getItem(key);
          const value = val != null ? val : 'false';
          return {[mealName]: value};
        }),
      );
      const data = Object.assign({}, ...tempData);
      // console.log('res', data);
      setIsFavorite(data);
      return data;
    }
    makeFavoriteInitStates();
  }, []);

  const exampleDateURL =
    'https://snuco.snu.ac.kr/ko/foodmenu?field_menu_date_value_1%5Bvalue%5D%5Bdate%5D=&field_menu_date_value%5Bvalue%5D%5Bdate%5D=09%2F23%2F2021';
  const todayMenuURL = 'https://snuco.snu.ac.kr/ko/foodmenu'; // 정보 받아와서 리스트에 저장, 각 식당의 리스트 인덱스 따로 저장

  // 식단 정보(url) 가져오기
  useEffect(() => {
    function fetchMenu() {
      axios.get(exampleDateURL).then(res => {
        const html = res.data;
        const root = parse(html);
        const data: TodaysMenu = {};
        chain(root.querySelector('tbody').childNodes)
          .map(trNode => {
            const trTexts = chain(trNode.childNodes)
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
            const splitedNameAndContact = split(nameAndContact, '(');
            const name = splitedNameAndContact[0];
            const contact = splitedNameAndContact[1].slice(0, -1);
            data[name] = {breakfast, lunch, dinner, contact};
          })
          .value();
        setMenu(data);
      });
    }

    fetchMenu();
  }, []);

  // 식당 메뉴 정보 정제
  // to do

  // 식당 일반 운영정보 크롤링
  useEffect(() => {
    axios.get('https://snuco.snu.ac.kr/ko/node/20').then(res => {
      const html = res.data;
      const root = parse(html);
      const data: Cafeteria[] = chain(root.querySelector('tbody').childNodes)
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
            nameAndContact,
            location,
            floors,
            scale,
            customer,
            weekday,
            saturday,
            holiday,
          ] = trTexts;
          return {
            nameAndContact,
            location,
            floors,
            customer,
            scale,
            weekday,
            saturday,
            holiday,
          };
        })
        .value();
      // setMarts(data);
      // console.log('1: ', data[18]);
      // console.log('2: ', data[1]);
    });
  });

  // 식당 리스트 정렬, 즐겨찾기와 나머지 구분
  const [favoriteMeal, notFavoriteMeal] = partition(
    mealList,
    item => isFavorite[item] === 'true',
  );

  // 즐겨찾기 설정 해제 함수
  async function switchFavorite(name: string) {
    const tempState = cloneDeep(isFavorite);
    const key = name + 'IsFavorite';
    if (tempState[name] === 'true') {
      // console.log('true to false');
      await AsyncStorage.setItem(key, 'false').then(() => {
        tempState[name] = 'false';
        setIsFavorite(tempState);
      });
    } else if (tempState[name] === 'false') {
      // console.log('false to true');
      await AsyncStorage.setItem(key, 'true').then(() => {
        tempState[name] = 'true';
        setIsFavorite(tempState);
      });
    }
    return tempState;
  }

  console.log('rendering');
  return (
    <VStack>
      <ScrollView>
        <Center>
          {favoriteMeal.map(name => (
            <Center
              width="90%"
              height="150px"
              bg="white"
              rounded="md"
              position="relative"
              marginTop={3}
              shadow={5}
              key={name}>
              <VStack position="relative" width="100%" height="100%">
                <Center
                  width="100%"
                  height="40px"
                  // position="relative"
                  // top="0px"
                  marginBottom={0}
                  bg={true ? '#F7E600' : 'black'} // isOperating
                  rounded="md"
                  shadow={2}>
                  <HStack display="flex" justifyContent="space-between">
                    <Text
                      color={true ? '#3A1D1D' : 'white'}
                      flex={5}
                      alignSelf="center"
                      textAlign="center">
                      {name}
                    </Text>
                    <Button onPress={() => switchFavorite(name)} flex={1}>
                      즐찾ㄴ
                    </Button>
                  </HStack>
                </Center>
                {name !== null && menu[name] !== undefined ? (
                  <ScrollView padding={3}>
                    <Text>
                      {menu[name].breakfast.length > 0
                        ? '아침: \n' +
                          replaceAll(menu[name].breakfast, '0원 ', '0원\n') +
                          '\n'
                        : ''}
                    </Text>
                    <Text>
                      {menu[name].lunch.length > 0
                        ? '점심: \n' +
                          replaceAll(menu[name].lunch, '0원 ', '0원\n') +
                          '\n'
                        : ''}
                    </Text>
                    <Text>
                      {menu[name].dinner.length > 0
                        ? '저녁: \n' +
                          replaceAll(menu[name].dinner, '0원 ', '0원\n') +
                          '\n'
                        : ''}
                    </Text>
                  </ScrollView>
                ) : (
                  <Text fontSize="xl">휴무</Text>
                )}
              </VStack>
            </Center>
          ))}
        </Center>

        <Center marginTop={3}>
          <VStack>
            {chunk(notFavoriteMeal, 3).map(subNotFavoriteMealInfoArray => {
              // not favorite meal 3줄로 나누기
              return (
                <HStack key={subNotFavoriteMealInfoArray[0]}>
                  {subNotFavoriteMealInfoArray.map(name => {
                    return (
                      <HStack key={name}>
                        <Button
                          onPress={() => setSelectedMeal(name)}
                          width="100px"
                          height="50px"
                          margin={2}
                          bg={true ? '#F7E600' : 'black'} // isOperating
                          rounded="md"
                          shadow={5}
                          key={name}>
                          <Text color={true ? '#3A1D1D' : 'white'}>{name}</Text>
                        </Button>
                      </HStack>
                    );
                  })}
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
              <HStack>
                {selectedMeal !== null ? (
                  <Text fontSize="xl">{selectedMeal}</Text>
                ) : (
                  <Text />
                )}
                <Button
                  width="60px"
                  height="40px"
                  padding={2}
                  onPress={() => switchFavorite(String(selectedMeal))}>
                  즐찾ㄱ
                </Button>
              </HStack>
              {selectedMeal !== null && menu[selectedMeal] !== undefined ? (
                <>
                  <Text>
                    {menu[selectedMeal].breakfast.length > 0
                      ? '아침: \n' +
                        replaceAll(
                          menu[selectedMeal].breakfast,
                          '0원 ',
                          '0원\n',
                        ) +
                        '\n'
                      : ''}
                  </Text>
                  <Text>
                    {menu[selectedMeal].lunch.length > 0
                      ? '점심: \n' +
                        replaceAll(menu[selectedMeal].lunch, '0원 ', '0원\n') +
                        '\n'
                      : ''}
                  </Text>
                  <Text>
                    {menu[selectedMeal].dinner.length > 0
                      ? '저녁: \n' +
                        replaceAll(menu[selectedMeal].dinner, '0원 ', '0원\n') +
                        '\n'
                      : ''}
                  </Text>
                </>
              ) : (
                <Text fontSize="xl">휴무</Text>
              )}
            </Modal.Body>
          </Modal.Content>
        </Modal>
      </ScrollView>
    </VStack>
  );
}

const style = StyleSheet.create({});

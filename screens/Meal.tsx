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
  };
  // state 선언
  const [menu, setMenu] = useState<TodaysMenu | null>(null); // store menu data here
  const [isFavorite, setIsFavorite] = useState<{} | null>(null); // store favorite or not here
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null); // store selected meal (modal) here

  // 식단 정보 크롤링
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
  }, []);

  // 식당 일반 운영정보 크롤링

  // 즐찾, 운영중에 맞게 세팅
  useEffect(() => {
    async function setFavoriteStates() {
      const tempData = await Promise.all(
        DUMMY_MEAL_INFO.map(async meal => {
          const trueOrFalse = await getIsFavorite(meal.name);
          return {[meal.name]: trueOrFalse};
        }),
      );
      const data = Object.assign({}, ...tempData);
      setIsFavorite(data);
    }
    setFavoriteStates();
  }, []);

  console.log(isFavorite);

  const storeIsFavorite = async (mealName: string | null) => {
    if (mealName === null) {
      return;
    }
    const key = mealName + 'IsFavorite';
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === 'true') {
        await AsyncStorage.setItem(key, 'false');
        const tempData: {[name: string]: boolean} = Object.assign(
          {},
          isFavorite,
        );
        tempData[mealName] = false;
        setIsFavorite(tempData);
      } else {
        await AsyncStorage.setItem(key, 'true');
        const tempData: {[name: string]: boolean} = Object.assign(
          {},
          isFavorite,
        );
        tempData[mealName] = true;
        setIsFavorite(tempData);
        // isFavorite[mealName] = true;
        // setIsFavorite(isFavorite);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getIsFavorite = async (mealName: string) => {
    const key = mealName + 'IsFavorite';
    const value = await AsyncStorage.getItem(key);
    try {
      if (value === 'true') {
        return true;
      } else if (value === 'false') {
        return false;
      } else {
        return false;
      }
    } catch (e) {
      console.log(e);
    }
  };

  // 식당 리스트 정렬

  const [favoriteMeal, notFavoriteMeal] = _.partition(
    DUMMY_MEAL_INFO,
    item => isFavorite[item.name],
  ); // 즐겨찾기와 나머지 구분

  console.log(favoriteMeal);
  console.log(notFavoriteMeal);

  favoriteMeal.sort((a, b) => Number(b.isOperating) - Number(a.isOperating)); // 즐겨찾기 중 운영 중인 곳 맨 위로
  notFavoriteMeal.sort((a, b) => Number(b.isOperating) - Number(a.isOperating)); // 즐겨찾기 아닌 식당 중 운영 중인 곳 맨 위로

  console.log('rendering');
  return (
    <VStack>
      <ScrollView>
        <Center>
          {favoriteMeal.map(({name, isOperating}) => (
            <Center
              width="90%"
              height="120px"
              bg="white"
              rounded="md"
              marginTop={3}
              shadow={5}
              key={name}>
              <Center
                width="100%"
                height="40px"
                position="absolute"
                top="0px"
                marginBottom={30}
                bg={isOperating ? '#F7E600' : 'black'}
                rounded="md"
                shadow={2}>
                <HStack>
                  <Text color={isOperating ? '#3A1D1D' : 'white'}>{name}</Text>
                  <Button
                    onPress={() => {
                      storeIsFavorite(name);
                    }}>
                    즐찾ㄴ
                  </Button>
                </HStack>
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
                  {subNotFavoriteMealInfoArray.map(({name, isOperating}) => {
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
              {selectedMeal !== null ? (
                <Text fontSize="3xl">{selectedMeal}</Text>
              ) : (
                <Text />
              )}
              <Button
                width="60px"
                height="40px"
                padding={2}
                onPress={() => {
                  storeIsFavorite(selectedMeal);
                }}>
                즐찾ㄱ
              </Button>
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

const style = StyleSheet.create({});

const DUMMY_MEAL_INFO: {
  name: string;
  isOperating: boolean;
}[] = [
  {
    name: '학생회관식당',
    isOperating: true,
  },
  {
    name: '자하연식당',
    isOperating: true,
  },
  {
    name: '예술계식당',
    isOperating: true,
  },
  {
    name: '소담마루',
    isOperating: true,
  },
  {
    name: '동원관식당',
    isOperating: false,
  },
  {
    name: '기숙사식당',
    isOperating: true,
  },
  {
    name: '공대간이식당',
    isOperating: false,
  },
  {
    name: '3식당',
    isOperating: true,
  },
  {
    name: '302동식당',
    isOperating: false,
  },
  {
    name: '301동식당',
    isOperating: true,
  },
  {
    name: '220동식당',
    isOperating: true,
  },
];

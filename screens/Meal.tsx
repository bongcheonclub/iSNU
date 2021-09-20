import AsyncStorage from '@react-native-async-storage/async-storage';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import React, {useState, useEffect} from 'react';
import {StyleSheet, useWindowDimensions} from 'react-native';
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
  Divider,
  Circle,
} from 'native-base';
import _, {
  size,
  chain,
  split,
  partition,
  chunk,
  cloneDeep,
  keyBy,
  floor,
} from 'lodash';
import axios from 'axios';
import {parse} from 'node-html-parser';
import {colors} from '../ui/colors';
import {
  compareAsc,
  getDate,
  getDay,
  getMonth,
  parse as parseTime,
} from 'date-fns';

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

function getTodaysDate() {
  const now = new Date();
  const month = getMonth(now);
  const date = getDate(now);
  const day = getDay(now);
  const koreanDay = (() => {
    if (day === 0) {
      return '일';
    }
    if (day === 1) {
      return '월';
    }
    if (day === 2) {
      return '화';
    }
    if (day === 3) {
      return '수';
    }
    if (day === 4) {
      return '목';
    }
    if (day === 5) {
      return '금';
    }
    if (day === 6) {
      return '토';
    }
  })();
  console.log(koreanDay + '요일');
  return [month, date, koreanDay, day];
}

export default function Meal({navigation}: Props) {
  const [month, date, koreanDay, day] = getTodaysDate();
  const window = useWindowDimensions();
  type TodaysMenu = {
    [name: string]: {
      breakfast: string;
      lunch: string;
      dinner: string;
      contact: string;
    };
  };
  type Cafeteria = {
    name: string;
    contact: string;
    location: string;
    floors: string;
    scale: string;
    customer: string;
    weekday: string;
    saturday: string;
    holiday: string;
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
  const [cafeteria, setCafeteria] = useState<Record<string, Cafeteria> | null>(
    null,
  );
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
            const [
              blank_1,
              nameAndContact,
              blank_2,
              breakfast,
              blank_3,
              lunch,
              blank_4,
              dinner,
            ] = trTexts;
            const [name, contact] = nameAndContact.split(/\(|\)/);
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
            .reverse()
            .filter(rows => rows.length > 0)
            .value();
          const [
            holiday,
            saturday,
            weekday,
            customer,
            scale,
            floors,
            location,
            nameAndContact,
          ] = trTexts;
          const [name, contact] = (() => {
            if (nameAndContact === undefined) {
              return ['undefined', 'undefined'];
            } else {
              return nameAndContact.split(/\(|\)/);
            }
          })();
          return {
            holiday,
            saturday,
            weekday,
            customer,
            scale,
            floors: floors || '2',
            location,
            name: name.trim(),
            contact,
          };
        })
        .map((item, idx, array) => {
          if (array[idx].location === undefined) {
            array[idx].location = array[idx - 1].location;
          }
          if (array[idx].name === 'undefined') {
            array[idx].name = array[idx - 1].name + ' ' + array[idx].floors;
          }
          if (array[idx].contact === 'undefined') {
            array[idx].contact = array[idx - 1].contact;
          }
          return item;
        })
        .value();
      const processedData = keyBy(data, 'name');
      console.log(processedData);
      setCafeteria(processedData);
    });
  }, []);

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
      <ScrollView bgColor={colors.white}>
        <Text
          fontSize="5xl"
          fontWeight={800}
          margin={4}
          marginLeft={(window.width - 332) / 2}
          color={colors.blue}>
          식당
        </Text>
        <Center>
          {favoriteMeal.map(name => (
            <Center
              width={332}
              height="120px"
              bg="#E9E7CE"
              rounded={15}
              position="relative"
              marginBottom={4}
              shadow={0}
              key={name}>
              <Circle
                size={2.5}
                bg={colors.green}
                position="absolute"
                top={2}
                right={2}
              />

              <HStack position="relative" width="100%" height="100%">
                <Button
                  onPress={() => setSelectedMeal(name)}
                  width="38%"
                  height="100%"
                  marginBottom={0}
                  padding={1}
                  bg="#E9E7CE"
                  rounded={15}>
                  <Text
                    color={colors.bage[200]}
                    fontWeight={800}
                    fontSize="xl"
                    marginBottom={4}
                    textAlign="center">
                    {name}
                  </Text>
                  <Text color={colors.grey[400]} textAlign="center">
                    몇시까지
                  </Text>
                </Button>
                {menu !== null && name !== null && menu[name] !== undefined ? (
                  <ScrollView padding={1}>
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
                  <Text fontSize="2xl" alignSelf="center" margin="auto">
                    휴무
                  </Text>
                )}
              </HStack>
            </Center>
          ))}
        </Center>

        <Center marginTop={0}>
          <VStack>
            {chunk(notFavoriteMeal, 3).map(subNotFavoriteMealInfoArray => {
              // not favorite meal 3줄로 나누기
              return (
                <HStack key={subNotFavoriteMealInfoArray[0]}>
                  {subNotFavoriteMealInfoArray.map(name => {
                    return (
                      <Box key={name}>
                        <Button
                          onPress={() => setSelectedMeal(name)}
                          width="100px"
                          height="100px"
                          margin={2}
                          bg={colors.grey[100]} // isOperating
                          borderColor={colors.grey[200]}
                          borderWidth={1}
                          rounded={15}
                          padding={0}
                          key={name}>
                          <Text
                            color={colors.grey[400]}
                            fontSize="lg"
                            fontWeight={500}>
                            {name}
                          </Text>
                        </Button>
                        <Circle
                          size={2.5}
                          bg={colors.green}
                          position="absolute"
                          top={4}
                          right={4}
                        />
                      </Box>
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
          <Modal.Content padding={0}>
            <Modal.CloseButton />
            <Modal.Body>
              {selectedMeal !== null ? (
                <Box margin={6} marginBottom={1}>
                  <Text
                    fontSize="2xl"
                    marginBottom={1}
                    color={colors.blue}
                    fontWeight={700}>
                    {selectedMeal}
                  </Text>
                  <Text color={colors.grey[300]}>
                    {cafeteria[selectedMeal].location}
                  </Text>
                  <Text color={colors.black} textAlign="center" marginTop={3}>
                    {month}월 {date}일 {koreanDay}요일
                  </Text>
                </Box>
              ) : (
                <Text />
              )}
              <Button
                width="60px"
                height="40px"
                position="absolute"
                right="60px"
                top="14px"
                padding={2}
                onPress={() => switchFavorite(String(selectedMeal))}>
                즐찾
              </Button>
              {selectedMeal !== null && menu[selectedMeal] !== undefined ? (
                <ScrollView margin={6}>
                  {menu[selectedMeal].breakfast.length > 0 ? (
                    <>
                      <Text>
                        {'아침: \n' +
                          replaceAll(
                            menu[selectedMeal].breakfast,
                            '0원 ',
                            '0원\n',
                          )}
                      </Text>
                      <Divider
                        my={2}
                        bg="black"
                        size={1}
                        marginTop={5}
                        marginBottom={5}
                      />
                    </>
                  ) : (
                    <Text />
                  )}

                  {menu[selectedMeal].lunch.length > 0 ? (
                    <>
                      <Text>
                        {'점심: \n' +
                          replaceAll(menu[selectedMeal].lunch, '0원 ', '0원\n')}
                      </Text>
                      <Divider
                        my={2}
                        bg="black"
                        size={1}
                        marginTop={5}
                        marginBottom={5}
                      />
                    </>
                  ) : (
                    <Text />
                  )}
                  {menu[selectedMeal].dinner.length > 0 ? (
                    <Text>
                      {'저녁: \n' +
                        replaceAll(menu[selectedMeal].dinner, '0원 ', '0원\n')}
                    </Text>
                  ) : (
                    <Text />
                  )}
                </ScrollView>
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

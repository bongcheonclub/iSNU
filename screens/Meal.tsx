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
  View,
  Text,
  VStack,
  Modal,
  Button,
  Divider,
  Circle,
} from 'native-base';
import {
  size,
  chain,
  split,
  partition,
  chunk,
  cloneDeep,
  keyBy,
  floor,
  fromPairs,
  keys,
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
import FilledStar from '../icons/filled-star.svg';
import UnfilledStar from '../icons/unfilled-star.svg';
import et from 'date-fns/esm/locale/et/index.js';
import {ParamListBase} from '@react-navigation/native';

function replaceAll(str: string, searchStr: string, replaceStr: string) {
  return str.split(searchStr).join(replaceStr);
}

type Props = BottomTabScreenProps<ParamListBase, '식당'>;

function getTodaysDate() {
  const now = new Date();
  const month = getMonth(now) + 1;
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

  // state 선언
  const [menu, setMenu] = useState<TodaysMenu | null>(null); // store menu data here
  const [mealList, setMealList] = useState<string[] | null>(null); // store menu data here
  const [cafeteria, setCafeteria] = useState<Record<string, Cafeteria> | null>(
    null,
  );
  const [favoriteList, setFavoriteList] = useState<string[]>([]);
  const [notFavoriteList, setNotFavoriteList] = useState<string[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null); // store selected meal (modal) here

  const exampleDateURL =
    'https://snuco.snu.ac.kr/ko/foodmenu?field_menu_date_value_1%5Bvalue%5D%5Bdate%5D=&field_menu_date_value%5Bvalue%5D%5Bdate%5D=09%2F23%2F2021';
  const todayMenuURL = 'https://snuco.snu.ac.kr/ko/foodmenu'; // 정보 받아와서 리스트에 저장, 각 식당의 리스트 인덱스 따로 저장

  // 식단 정보(menu) 및 식당 운영 정보(info) 가져오기, 즐겨찾기 리스트 가져오기
  useEffect(() => {
    function fetchMenu() {
      // 식단 정보 가져오는 함수
      axios.get(todayMenuURL).then(res => {
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
            const rawName = nameAndContact.split(/\(|\)/)[0];
            const contact = nameAndContact.split(/\(|\)/)[1];
            const name =
              rawName.trim() === '3식당'
                ? rawName.trim()
                : rawName.trim() === '공대간이식당'
                ? '공간'
                : rawName.trim().replace('식당', '');

            data[name] = {breakfast, lunch, dinner, contact};
          })
          .value();
        setMenu(data);
      });
    }
    function fetchInfo() {
      // 식당 일반 운영정보 가져오는 함수
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
                const rawName = nameAndContact.split(/\(|\)/)[0];

                return [
                  rawName.trim() === '3식당'
                    ? rawName.trim()
                    : rawName.trim() === '공대간이식당'
                    ? '공간'
                    : rawName.trim().replace('식당', ''),
                  nameAndContact.split(/\(|\)/)[1],
                ];
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
              name:
                name.trim() === '3식당'
                  ? name.trim()
                  : name.trim() === '공대간이식당'
                  ? '공간'
                  : name.trim().replace('식당', ''),
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
        const refinedMealList = data
          .filter(item => {
            // 학관 지하 등 필터링
            return (
              !item.name.includes(' ') &&
              !item.name.includes('라운지오') &&
              !item.name.includes('두레미담')
            );
          })
          .map(item => {
            return item.name;
          })
          .concat('대학원기숙사');
        setCafeteria(processedData);
        setMealList(refinedMealList);

        async function makeFavoriteInitStates(initialMealList: string[]) {
          // 즐겨찾기 가져오는 함수
          const key = 'favoriteMealList';
          const getList = await AsyncStorage.getItem(key);
          const getFavoriteList = getList ? JSON.parse(getList) : [];
          const getNotFavoriteList = initialMealList.filter(
            mealName => !getFavoriteList.includes(mealName),
          );
          setFavoriteList(getFavoriteList);
          setNotFavoriteList(getNotFavoriteList);
        }
        makeFavoriteInitStates(refinedMealList);
      });
    }
    fetchMenu();
    fetchInfo();
  }, []);

  // 식당 메뉴 정보 정제
  // to do

  // 대학원기숙사 메뉴 크롤링 로직
  useEffect(() => {
    if (
      menu !== null &&
      menu['대학원기숙사'] === undefined &&
      cafeteria !== null &&
      cafeteria['대학원기숙사'] === undefined
    ) {
      axios.get('https://snudorm.snu.ac.kr/food-schedule/').then(res => {
        const html = res.data;
        const root = parse(html);
        const data = chain(root.querySelector('tbody').childNodes)
          .map(trNode => {
            const trTexts = chain(trNode.childNodes)
              .filter(tdNode => {
                return (
                  tdNode !== undefined &&
                  tdNode.classList !== undefined &&
                  ![...tdNode.classList._set].includes('bg')
                );
              })
              .map((tdNode, idx) => {
                if (tdNode.innerText.length === 0) {
                  return ' ';
                }
                return tdNode.innerText;
              })
              .value();
            const [
              sunday,
              monday,
              tuesday,
              wednesday,
              thursday,
              friday,
              saturday,
            ] = trTexts;

            return [
              sunday,
              monday,
              tuesday,
              wednesday,
              thursday,
              friday,
              saturday,
            ];
          })
          .filter(item => item[1] !== undefined)
          .value();
        // data[0], data[1]은 [day:아침메뉴] 객체, 234점심, 567저녁, 8910은 919식당
        const breakfast = data[0][day] + data[1][day];
        const lunch = data[2][day] + data[3][day] + data[4][day];
        const dinner = data[5][day] + data[6][day] + data[7][day];
        const contact = 'unknwon';
        const todaysMenu: TodaysMenu = {
          대학원기숙사: {breakfast, lunch, dinner, contact},
        };
        const menuIncludeOurhome = {...menu, ...todaysMenu};
        setMenu(menuIncludeOurhome);
        const ourhomeCafeteria = {
          name: '대학원기숙사',
          contact: 'unknown',
          location: '901동',
          floors: '1층',
          scale: 'unknown',
          customer: '학생',
          weekday: '08:00-09:30 11:30-13:30 17:30-19:30',
          saturday: '08:00-09:30 11:30-13:30 17:30-19:30',
          holiday: '08:00-09:30 11:30-13:30 17:30-19:30',
        };
        const cafeteriaIncludeOurhome = {
          ...cafeteria,
          대학원기숙사: ourhomeCafeteria,
        };
        setCafeteria(cafeteriaIncludeOurhome);
      });
    }
  }, [cafeteria, day, menu]);

  // 즐겨찾기 설정 해제 함수
  async function editFavoriteList(name: string) {
    const key = 'favoriteMealList';
    const storedFavoriteMealList = await AsyncStorage.getItem(key).then(
      storedFavoriteMealListString => {
        if (
          storedFavoriteMealListString === undefined ||
          storedFavoriteMealListString === null
        ) {
          return [];
        } else {
          return JSON.parse(storedFavoriteMealListString);
        }
      },
    );
    const newFavoriteList = (await storedFavoriteMealList.includes(name))
      ? storedFavoriteMealList.filter((item: string) => item !== name)
      : storedFavoriteMealList.concat(name);
    const newNotFavoriteList = mealList.filter(
      item => !newFavoriteList.includes(item),
    );
    await AsyncStorage.setItem(key, JSON.stringify(newFavoriteList)).then(
      () => {
        setFavoriteList(newFavoriteList);
        setNotFavoriteList(newNotFavoriteList);
      },
    );
  }

  function showMenu(cafeteriaName, whichMenu) {
    const string = menu[cafeteriaName][whichMenu];
    if (cafeteriaName.includes('자하연')) {
      return string
        .split('※')[0]
        .split('원 ')
        .map(item => {
          return item.split(' ');
        })
        .map(menuAndPrice => {
          if (menuAndPrice.length !== 2) {
            return;
          }
          const [menuName, price] = [
            menuAndPrice[0].replace('&amp;', '&\n'),
            menuAndPrice[1] + '원',
          ];
          return (
            <HStack
              alignItems="center"
              paddingTop="3px"
              paddingBottom="3px"
              key={menuName}>
              <Text textAlign="center" width="70%" fontSize="lg">
                {menuName}
              </Text>
              <Text textAlign="right" width="30%" fontSize="md">
                {price}
              </Text>
            </HStack>
          );
        });
    }

    if (cafeteriaName.includes('예술계')) {
      return string
        .split('▶')[0]
        .split('원 ')
        .map(item => {
          return item.split(' : ');
        })
        .map(menuAndPrice => {
          if (menuAndPrice.length !== 2) {
            return;
          }
          const [menuName, price] = [
            menuAndPrice[0].replace('&amp;', '&\n'),
            menuAndPrice[1] + '원',
          ];
          return (
            <HStack
              alignItems="center"
              paddingTop="3px"
              paddingBottom="3px"
              key={menuName}>
              <Text textAlign="center" width="70%" fontSize="lg">
                {menuName}
              </Text>
              <Text textAlign="right" width="30%" fontSize="md">
                {price}
              </Text>
            </HStack>
          );
        });
    }

    if (cafeteriaName.includes('220동')) {
      return string
        .split('※')[0]
        .split('원 ')
        .map(item => {
          return item.split(' ');
        })
        .map(menuAndPrice => {
          if (
            menuAndPrice.length !== 2 &&
            !menuAndPrice[0].includes('플러스메뉴')
          ) {
            return;
          }
          const [menuName, price] = menuAndPrice[0].includes('플러스메뉴')
            ? [
                (menuAndPrice[0] + '\n' + menuAndPrice[1]).replaceAll(
                  '&amp;',
                  '&\n',
                ),
                menuAndPrice[2] + '원',
              ]
            : [
                menuAndPrice[0].replaceAll('&amp;', '&\n'),
                menuAndPrice[1] + '원',
              ];
          return (
            <HStack
              alignItems="center"
              paddingTop="3px"
              paddingBottom="3px"
              key={menuName}>
              <Text textAlign="center" width="70%" fontSize="lg" marginTop={2}>
                {menuName}
              </Text>
              <Text textAlign="right" width="30%" fontSize="md">
                {price}
              </Text>
            </HStack>
          );
        });
    }

    if (cafeteriaName.includes('감골')) {
      return string
        .split('※')[0]
        .split('원 ')
        .map(item => {
          return item.split(' ');
        })
        .map(menuAndPrice => {
          if (menuAndPrice.length !== 2) {
            return;
          }
          const [menuName, price] = [
            menuAndPrice[0]
              .replace('&amp;', '&\n')
              .replace('&lt;', '<')
              .replace('&gt;', '>'),
            menuAndPrice[1] + '원',
          ];
          return (
            <HStack
              alignItems="center"
              paddingTop="3px"
              paddingBottom="3px"
              key={menuName}>
              <Text textAlign="center" width="70%" fontSize="lg" marginTop={2}>
                {menuName}
              </Text>
              <Text textAlign="right" width="30%" fontSize="md">
                {price}
              </Text>
            </HStack>
          );
        });
    }

    if (cafeteriaName.includes('대학원')) {
      return string
        .match(/[A-Z]/gi)
        .map((priceSymbol, priceIndex) => {
          return [
            string.split(/[A-Z]/)[priceIndex + 1],
            (priceSymbol.charCodeAt(0) - 65) * 500 + 2000,
          ];
        })
        .map(menuAndPrice => {
          const [menuName, price] = [
            menuAndPrice[0].replace('&', '&\n'),
            menuAndPrice[1] + '원',
          ];
          return (
            <HStack
              alignItems="center"
              paddingTop="3px"
              paddingBottom="3px"
              key={menuName}>
              <Text textAlign="center" width="70%" fontSize="lg" marginTop={2}>
                {menuName}
              </Text>
              <Text textAlign="right" width="30%" fontSize="md">
                {price}
              </Text>
            </HStack>
          );
        });
    }

    if (cafeteriaName.includes('소담마루')) {
      return (
        <Text textAlign="center" width="70%" fontSize="lg">
          {string}
        </Text>
      );
    }

    if (cafeteriaName.includes('공간') || cafeteriaName.includes('301')) {
      return (
        <Text textAlign="center" width="100%" fontSize="md">
          {string
            .replaceAll('00원', '00원\n')
            .replaceAll('소반', '\n소반')
            .replaceAll('&amp;', '&\n')
            .replaceAll('&lt;', '\n<')
            .replaceAll('&gt;', '>\n')}
        </Text>
      );
    }
    if (
      string.includes('휴관') ||
      string.includes('휴점') ||
      string.includes('폐점')
    ) {
      return (
        <Text textAlign="center" fontSize="lg">
          휴무/휴점
        </Text>
      );
    }

    return string
      .split('원 ')
      .map(text => {
        return text.split(' ');
      })
      .map(menuAndPrice => {
        if (menuAndPrice[0].includes('※')) {
          return;
        }
        const [menuName, price] = [
          menuAndPrice[0].replace('&amp;', '&\n'),
          menuAndPrice[1] + '원',
        ];
        return (
          <HStack
            alignItems="center"
            paddingTop="3px"
            paddingBottom="3px"
            key={menuName}>
            <Text textAlign="center" width="70%" fontSize="lg">
              {menuName}
            </Text>
            <Text textAlign="right" width="30%" fontSize="md">
              {price}
            </Text>
          </HStack>
        );
      });
  }

  function showFavoriteMenu(cafeteriaName) {
    if (checkStatus === null) {
      return <Text>Loading</Text>;
    }
    const [status, nextTime] = [
      checkStatus[cafeteriaName].status,
      checkStatus[cafeteriaName].nextTime,
    ];
    if (status === 'breakfast' || status === 'lunch' || status === 'dinner') {
      const string = menu[cafeteriaName][status];
      return string
        .split('원 ')
        .map(text => {
          return text.split(' ');
        })
        .map(menuAndPrice => {
          if (menuAndPrice[0].includes('※')) {
            return;
          }
          const [menuName, price] = [
            menuAndPrice[0].replace('&amp;', '&\n'),
            menuAndPrice[1] + '원',
          ];
          return (
            <HStack
              alignItems="center"
              paddingTop="2px"
              paddingBottom="2px"
              key={menuName}>
              <Text
                textAlign="center"
                width="60%"
                fontSize="md"
                fontWeight={600}
                color="#59584E">
                {menuName}
              </Text>
              <Text
                textAlign="right"
                width="40%"
                fontSize="md"
                paddingRight={4}
                color="#8B7A55">
                {price}
              </Text>
            </HStack>
          );
        });
    } else {
      return (
        <Text color="#888888" fontSize="lg">
          {nextTime} 운영 예정
        </Text>
      );
    }
  }

  const [checkStatus, setCheckStatus] = useState(null);
  useEffect(() => {
    if (
      menu !== null &&
      menu['대학원기숙사'] !== undefined &&
      cafeteria !== null &&
      cafeteria['대학원기숙사'] !== undefined
    ) {
      const temp = mealList
        .map(cafeteriaName => {
          return {
            name: cafeteriaName,
            status: checkOperating(cafeteriaName)[0],
            nextTime: checkOperating(cafeteriaName)[1],
          };
        })
        .map(item => item);
      const data = keyBy(temp, 'name');
      setCheckStatus(data);
    }
    function checkOperating(cafeteriaName) {
      if (cafeteria[cafeteriaName] === undefined) {
        return ['end', '추후'];
      }
      const now = new Date('Tue Sep 28 2021 12:34:15 GMT+0900');
      const today = (() => {
        switch (day) {
          case 0: // sunday
            return 'holiday';
          case 6: // saturday
            return 'saturday';
          default:
            return 'weekday';
        }
      })();
      const rawData = cafeteria[cafeteriaName][today];
      if (rawData === '휴관' || rawData === '휴점 중') {
        return ['end', '추후'];
      }
      const additionalInfo = rawData
        .split(' ')
        .filter(item => item[0] === '(')[0];
      const normalInfo = rawData
        .split(' ')
        .filter(
          item => item[0] !== '(' && item[-1] !== ')' && item.includes('0'),
        )
        .join('-')
        .split('-');
      normalInfo.unshift('00:00');
      if (normalInfo.length === 7) {
        const results = [
          'beforeBreakfast',
          'breakfast',
          'beforeLunch',
          'lunch',
          'beforeDinner',
          'dinner',
        ];
        return results
          .map((result, idx) => {
            const [startAtString, endedAtString] = [
              normalInfo[idx],
              normalInfo[idx + 1],
            ];
            const startAt = parseTime(startAtString, 'HH:mm', now);
            const endedAt = parseTime(endedAtString, 'HH:mm', now);
            if (compareAsc(startAt, now) < 0 && compareAsc(now, endedAt) < 0) {
              return [result, normalInfo[idx + 1]];
            } else if (idx === 6) {
              return ['end', normalInfo[0]];
            }
          })
          .filter(item => item !== undefined)[0];
      } else if (normalInfo.length === 5) {
        const results = ['beforeLunch', 'lunch', 'beforeDinner', 'dinner'];
        return results
          .map((result, idx) => {
            const [startAtString, endedAtString] = [
              normalInfo[idx],
              normalInfo[idx + 1],
            ];
            const startAt = parseTime(startAtString, 'HH:mm', now);
            const endedAt = parseTime(endedAtString, 'HH:mm', now);
            if (compareAsc(startAt, now) < 0 && compareAsc(now, endedAt) < 0) {
              return [result, normalInfo[idx + 1]];
            } else if (idx === 4) {
              return ['end', normalInfo[0]];
            }
          })
          .filter(item => item !== undefined)[0];
      } else if (normalInfo.length === 3) {
        const results = ['beforeLunch', 'lunch'];
        return results
          .map((result, idx) => {
            const [startAtString, endedAtString] = [
              normalInfo[idx],
              normalInfo[idx + 1],
            ];
            const startAt = parseTime(startAtString, 'HH:mm', now);
            const endedAt = parseTime(endedAtString, 'HH:mm', now);
            if (compareAsc(startAt, now) < 0 && compareAsc(now, endedAt) < 0) {
              return [result, normalInfo[idx + 1]];
            } else if (idx === 2) {
              return ['end', normalInfo[0]];
            }
          })
          .filter(item => item !== undefined)[0];
      } else {
        return ['end', '추후'];
      }
    }
  }, [menu, cafeteria, mealList, day]);

  function isOperating(name) {
    if (checkStatus === null) {
      return false;
    }
    if (
      checkStatus[name].status === 'breakfast' ||
      checkStatus[name].status === 'lunch' ||
      checkStatus[name].status === 'dinner'
    ) {
      return true;
    } else {
      return false;
    }
  }
  console.log('rendering');

  return (
    <VStack>
      <ScrollView bgColor={colors.white} height="100%">
        <Center marginTop={5}>
          {favoriteList.map(name => (
            <Center
              width="332px"
              height={isOperating(name) ? '124px' : '80px'}
              bg={isOperating(name) ? '#E9E7CE' : '#E2E2E2'}
              rounded={10}
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

              <Button
                backgroundColor="transparent"
                padding={0}
                onPress={() => setSelectedMeal(name)}>
                <HStack
                  position="relative"
                  width="100%"
                  height="100%"
                  padding={0}>
                  <Center
                    width="30%"
                    height="100%"
                    marginBottom={0}
                    padding={1}
                    bg="transparent"
                    rounded={15}>
                    <Text
                      color={colors.bage[200]}
                      fontWeight={800}
                      fontSize="xl"
                      textAlign="center">
                      {name}
                    </Text>
                    {isOperating(name) ? (
                      <Text
                        color={colors.grey[400]}
                        textAlign="center"
                        marginTop={4}>
                        ~{checkStatus[name].nextTime}
                      </Text>
                    ) : (
                      <Box height="0px" />
                    )}
                  </Center>
                  {menu !== null &&
                  name !== null &&
                  menu[name] !== undefined ? (
                    <Center width="70%" padding={0}>
                      {showFavoriteMenu(name)}
                    </Center>
                  ) : (
                    <Text
                      color="#888888"
                      fontSize="lg"
                      alignSelf="center"
                      margin="auto">
                      추후 운영 예정
                    </Text>
                  )}
                </HStack>
              </Button>
            </Center>
          ))}
        </Center>
        <Center marginTop={0} marginBottom={12}>
          <VStack>
            {chunk(notFavoriteList, 3).map(subNotFavoriteListInfoArray => {
              // not favorite meal 3줄로 나누기
              return (
                <HStack key={subNotFavoriteListInfoArray[0]}>
                  {subNotFavoriteListInfoArray.map(name => {
                    return (
                      <Box key={name}>
                        <Button
                          onPress={() => setSelectedMeal(name)}
                          colorScheme="dark"
                          width="100px"
                          height="100px"
                          margin={2}
                          bg={colors.grey[100]} // isOperating
                          borderColor={colors.grey[200]}
                          borderWidth={1}
                          rounded={10}
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
        {selectedMeal !== null ? (
          <Modal // modal 구현
            isOpen={selectedMeal !== null}
            onClose={() => setSelectedMeal(null)}>
            <Modal.Content padding={0} width="90%">
              <Modal.CloseButton />
              <Modal.Body>
                {selectedMeal !== null ? (
                  <Box margin={6} marginBottom={1}>
                    <HStack left={-15} top={-15}>
                      <Text
                        fontSize="2xl"
                        marginBottom={1}
                        color={colors.blue}
                        fontWeight={700}>
                        {selectedMeal}
                      </Text>
                      <Button
                        bgColor="transparent"
                        left={-4}
                        top={-3}
                        onPress={() => editFavoriteList(String(selectedMeal))}>
                        {favoriteList.includes(selectedMeal) ? (
                          <FilledStar />
                        ) : (
                          <UnfilledStar />
                        )}
                      </Button>
                    </HStack>
                    <Text color={colors.grey[300]} left={-15} top={-20}>
                      {cafeteria[selectedMeal].location}
                    </Text>
                    <Text color={colors.black} textAlign="center" marginTop={3}>
                      {month}월 {date}일 ({koreanDay})
                    </Text>
                  </Box>
                ) : (
                  <Text />
                )}
                {selectedMeal !== null && menu[selectedMeal] !== undefined ? (
                  <ScrollView
                    margin={5}
                    marginLeft={1}
                    marginRight={1}
                    maxHeight="400px"
                    bounces={false}>
                    {menu[selectedMeal].breakfast.length > 0 ? (
                      <>
                        <HStack>
                          <VStack width="25%" justifyContent="center">
                            <Text
                              textAlign="center"
                              fontSize="lg"
                              fontWeight={600}>
                              아침
                            </Text>
                            <Text
                              textAlign="center"
                              fontSize={10}
                              color={colors.grey[300]}>
                              00:00 ~ 00:00
                            </Text>
                          </VStack>
                          <VStack width="75%">
                            {showMenu(selectedMeal, 'breakfast')}
                          </VStack>
                        </HStack>
                        <Divider
                          my={2}
                          bg="black"
                          width="100%"
                          marginTop={5}
                          marginBottom={5}
                        />
                      </>
                    ) : (
                      <Text />
                    )}

                    {menu[selectedMeal].lunch.length > 0 ? (
                      <HStack>
                        <VStack width="25%" justifyContent="center">
                          <Text
                            textAlign="center"
                            fontSize="xl"
                            fontWeight={600}>
                            점심
                          </Text>
                          <Text
                            textAlign="center"
                            fontSize={11}
                            color={colors.grey[300]}>
                            00:00 ~ 00:00
                          </Text>
                        </VStack>
                        <VStack width="75%">
                          {showMenu(selectedMeal, 'lunch')}
                        </VStack>
                      </HStack>
                    ) : (
                      <Text />
                    )}
                    {menu[selectedMeal].dinner.length > 0 ? (
                      <>
                        <Divider
                          my={2}
                          bg="black"
                          width="100%"
                          marginTop={5}
                          marginBottom={5}
                        />
                        <HStack>
                          <VStack width="25%" justifyContent="center">
                            <Text
                              textAlign="center"
                              fontSize="lg"
                              fontWeight={600}>
                              저녁
                            </Text>
                            <Text
                              textAlign="center"
                              fontSize={10}
                              color={colors.grey[300]}>
                              00:00 ~ 00:00
                            </Text>
                          </VStack>
                          <VStack width="75%">
                            {showMenu(selectedMeal, 'dinner')}
                          </VStack>
                        </HStack>
                      </>
                    ) : (
                      <Text />
                    )}
                  </ScrollView>
                ) : (
                  <Text />
                )}
              </Modal.Body>
            </Modal.Content>
          </Modal>
        ) : (
          <Box />
        )}
      </ScrollView>
    </VStack>
  );
}

const style = StyleSheet.create({});

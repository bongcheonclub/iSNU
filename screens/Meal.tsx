import AsyncStorage from '@react-native-async-storage/async-storage';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import React, {useState, useEffect, useMemo} from 'react';
import {StyleSheet, useWindowDimensions} from 'react-native';
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
  AspectRatio,
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
  trim,
  last,
  Dictionary,
} from 'lodash';
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
import {check} from 'prettier';
import {MealData} from '../helpers/initializeData';
import {FAVORITE_STORAGE_KEY} from '../constants';

type Props = BottomTabScreenProps<ParamListBase, '식당'> & {
  mealData: MealData;
};

function checkOperating(
  cafeteriaName: string,
  cafeteria: MealData['cafeteria'],
):
  | [string, string]
  | [
      string,
      string,
      Dictionary<{
        when: string;
        time: string;
      }>,
    ] {
  // const now = new Date();
  const now = new Date('Tue Sep 23 2021 12:24:15 GMT+0900');
  const spliter = cafeteriaName.includes('감골') ? '~' : '-';
  const today = (() => {
    switch (
      getDay(now) // day
    ) {
      case 0: // sunday
        return 'holiday';
      case 6: // saturday
        return 'saturday';
      default:
        return 'weekday';
    }
  })();
  const rawData = cafeteria[cafeteriaName][today];
  if (rawData === '휴관' || rawData === '휴점 중' || rawData === '') {
    return ['end', '추후'];
  }
  const additionalInfo = rawData.split(' ').filter(item => item[0] === '(')[0];
  const times = rawData
    .split(' ')
    .filter(item => item[0] !== '(' && item[-1] !== ')' && item.includes('0'))
    .join(spliter)
    .split(spliter);
  times.unshift('00:00');

  const results = (() => {
    if (times.length === 7) {
      return [
        'beforeBreakfast',
        'breakfast',
        'beforeLunch',
        'lunch',
        'beforeDinner',
        'dinner',
      ];
    } else if (times.length === 5) {
      return ['beforeLunch', 'lunch', 'beforeDinner', 'dinner'];
    } else if (times.length === 3) {
      return ['beforeLunch', 'lunch'];
    } else {
      return null;
    }
  })();

  if (results === null) {
    return ['end', '추후'];
  }

  const operatingInfo = chain(results)
    .map((when, index) => {
      return {when: when, time: times[index + 1]};
    })
    .keyBy('when')
    .value();

  const result =
    results.find((_, idx) => {
      const [startAtString, endedAtString] = [times[idx], times[idx + 1]];
      const startAt = parseTime(startAtString, 'HH:mm', now);
      const endedAt = parseTime(endedAtString, 'HH:mm', now);
      if (compareAsc(startAt, now) < 0 && compareAsc(now, endedAt) < 0) {
        return true;
      }
    }) ?? 'end';

  const indexOfResult = results.indexOf(result);

  if (indexOfResult === -1) {
    return [result, '내일 ' + times[1], operatingInfo];
  } else {
    return [result, times[indexOfResult + 1], operatingInfo];
  }
}

export default function Meal({navigation, mealData}: Props) {
  const window = useWindowDimensions();

  const {
    menu,
    cafeteria,
    mealList,
    favoriteList: initialFavoriteList,
    nonFavoriteList: initialNonFavoriteList,
    month,
    date,
    koreanDay,
  } = mealData;

  const [selectedMeal, setSelectedMeal] = useState<string | null>(null); // store selected meal (modal) here

  const [favoriteList, setFavoriteList] =
    useState<string[]>(initialFavoriteList);
  const [nonFavoriteList, setNonFavoriteList] = useState<string[]>(
    initialNonFavoriteList,
  );

  // 즐겨찾기 설정 해제 함수
  async function editFavoriteList(name: string) {
    if (mealList === null) {
      return null;
    }

    const tempItem = await AsyncStorage.getItem(FAVORITE_STORAGE_KEY.meal);
    const storedFavoriteMealList =
      tempItem === undefined || tempItem === null ? [] : JSON.parse(tempItem);
    const newFavoriteList = (await storedFavoriteMealList.includes(name))
      ? storedFavoriteMealList.filter((item: string) => item !== name)
      : storedFavoriteMealList.concat(name);
    const newnonFavoriteList = mealList.filter(
      item => !newFavoriteList.includes(item),
    );
    await AsyncStorage.setItem(
      FAVORITE_STORAGE_KEY.meal,
      JSON.stringify(newFavoriteList),
    ).then(() => {
      setFavoriteList(newFavoriteList);
      setNonFavoriteList(newnonFavoriteList);
    });
  }

  function refineMenuName(rawText: string) {
    const splitedText = rawText.split(/\+|&|\*/).map(item => item.trim());

    const refinedMenuNameArray: string[] = [];
    splitedText.forEach((item, idx) => {
      const lastIndex = refinedMenuNameArray.length - 1;
      if (lastIndex === -1) {
        refinedMenuNameArray.push(item);
      } else {
        if (refinedMenuNameArray[lastIndex].length + item.length > 8) {
          refinedMenuNameArray[lastIndex] =
            refinedMenuNameArray[lastIndex] + '\n';
          refinedMenuNameArray.push('+' + item);
        } else if (refinedMenuNameArray[lastIndex].length + item.length <= 8) {
          refinedMenuNameArray[lastIndex] =
            refinedMenuNameArray[lastIndex] + '+' + item;
        }
      }
    });
    return refinedMenuNameArray.join('');
  }

  function showMenu(
    cafeteriaName: string,
    whichMenu: 'breakfast' | 'lunch' | 'dinner',
  ) {
    if (!menu) {
      return null;
    }
    // 메뉴 표기
    const string = menu[cafeteriaName][whichMenu];
    if (cafeteriaName.includes('자하연')) {
      return string
        .split('※')[0]
        .split('원 ')
        .map(item => {
          return item.split('&amp;').join('&').split(' ');
        })
        .map(menuAndPrice => {
          if (menuAndPrice.length !== 2) {
            return;
          }
          const [menuName, price] = [
            refineMenuName(menuAndPrice[0]),
            menuAndPrice[1] + '원',
          ];
          return (
            <HStack
              alignItems="center"
              marginTop="6px"
              marginBottom="6px"
              key={menuName}>
              <Text
                textAlign="center"
                width="70%"
                fontSize="lg"
                lineHeight="sm">
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
          return item.split('&amp;').join('&\n').split(' : ');
        })
        .map(menuAndPrice => {
          if (menuAndPrice.length !== 2) {
            return;
          }
          const [menuName, price] = [
            refineMenuName(menuAndPrice[0]),
            menuAndPrice[1] + '원',
          ];
          return (
            <HStack
              alignItems="center"
              marginTop="6px"
              marginBottom="6px"
              key={menuName}>
              <Text
                textAlign="center"
                width="70%"
                fontSize="lg"
                lineHeight="sm">
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
          return item.split('&amp;').join('&\n').split(' ');
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
                refineMenuName(menuAndPrice[0] + '\n' + menuAndPrice[1]),
                menuAndPrice[2] + '원',
              ]
            : [refineMenuName(menuAndPrice[0]), menuAndPrice[1] + '원'];
          return (
            <HStack
              alignItems="center"
              marginTop="6px"
              marginBottom="6px"
              key={menuName}>
              <Text
                textAlign="center"
                width="70%"
                fontSize="lg"
                marginTop={2}
                lineHeight="sm">
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
          return item
            .split('&amp;')
            .join('&\n')
            .split('&lt;')
            .join('<')
            .split('&gt;')
            .join('>')
            .split(' ');
        })
        .map(menuAndPrice => {
          if (menuAndPrice.length !== 2) {
            return;
          }
          const [menuName, price] = [
            refineMenuName(menuAndPrice[0]),
            menuAndPrice[1] + '원',
          ];
          return (
            <HStack
              alignItems="center"
              marginTop="6px"
              marginBottom="6px"
              key={menuName}>
              <Text
                textAlign="center"
                width="70%"
                fontSize="lg"
                marginTop={2}
                lineHeight="sm">
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
      const matchedStrings = string.match(/[A-Z]|\(\d,\d\d\d원\)/gi);
      if (!matchedStrings) {
        return null;
      }
      return matchedStrings
        .map((priceSymbol, priceIndex) => {
          if (priceSymbol.length === 1) {
            return {
              parsedString:
                string.split(/[A-Z]|\(\d,\d\d\d원\)/)[priceIndex + 1],
              price: `${(priceSymbol.charCodeAt(0) - 65) * 500 + 2000}원`,
            };
          } else {
            return {
              parsedString:
                string.split(/[A-Z]|\(\d,\d\d\d원\)/)[priceIndex + 1],
              price: `${priceSymbol.slice(1, -2)}원`,
            };
          }
        })
        .map(({parsedString, price}) => {
          const menuName = refineMenuName(parsedString);

          return (
            <HStack
              alignItems="center"
              marginTop="6px"
              marginBottom="6px"
              key={menuName}>
              <Text
                textAlign="center"
                width="70%"
                fontSize="lg"
                marginTop={2}
                lineHeight="sm">
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

    if (cafeteriaName.includes('공간')) {
      return (
        <Text textAlign="center" width="100%" fontSize="md">
          {string
            .split('00원')
            .join('00원\n')
            .split('&amp;')
            .join('&\n')
            .split('&lt;')
            .join('\n<')
            .split('&gt;')
            .join('>\n')}
        </Text>
      );
    }
    if (cafeteriaName.includes('301')) {
      return (
        <Text textAlign="center" width="100%" fontSize="md">
          {string
            .split('00원')
            .join('00원\n')
            .split('소반')
            .join('\n소반')
            .split('&amp;')
            .join('&\n')
            .split('&lt;')
            .join('\n<')
            .split('&gt;')
            .join('>\n')}
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
        return text.split('&amp;').join('&').split(' ');
      })
      .map(menuAndPrice => {
        if (menuAndPrice[0].includes('※')) {
          return;
        }
        const [menuName, price] = [
          refineMenuName(menuAndPrice[0]),
          menuAndPrice[1] + '원',
        ];
        return (
          <HStack
            alignItems="center"
            marginTop="6px"
            marginBottom="6px"
            key={menuName}>
            <Text textAlign="center" width="70%" fontSize="lg" lineHeight="sm">
              {menuName}
            </Text>
            <Text textAlign="right" width="30%" fontSize="md">
              {price}
            </Text>
          </HStack>
        );
      });
  }

  function showFavoriteMenu(cafeteriaName: string) {
    if (checkStatus === null || menu === null) {
      return <Text>Loading</Text>;
    }
    const [status, nextTime] = [
      checkStatus[cafeteriaName].status,
      checkStatus[cafeteriaName].nextTime,
    ];
    if (status === 'breakfast' || status === 'lunch' || status === 'dinner') {
      const string = menu[cafeteriaName][status];
      if (cafeteriaName.includes('자하연')) {
        return string
          .split('※')[0]
          .split('원 ')
          .map(item => {
            return item.split('&amp;').join('&').split(' ');
          })
          .map(menuAndPrice => {
            if (menuAndPrice.length !== 2) {
              return;
            }
            const [menuName, price] = [
              refineMenuName(menuAndPrice[0]),
              menuAndPrice[1] + '원',
            ];
            return (
              <HStack
                alignItems="center"
                marginTop="6px"
                marginBottom="6px"
                key={menuName}>
                <Text
                  textAlign="center"
                  width="60%"
                  fontSize="md"
                  fontWeight={600}
                  lineHeight="sm"
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
      }

      if (cafeteriaName.includes('예술계')) {
        return string
          .split('▶')[0]
          .split('원 ')
          .map(item => {
            return item.split('&amp;').join('&').trim().split(' : ');
          })
          .map(menuAndPrice => {
            if (menuAndPrice.length !== 2) {
              return;
            }
            const [menuName, price] = [
              refineMenuName(menuAndPrice[0]),
              menuAndPrice[1] + '원',
            ];
            return (
              <HStack
                alignItems="center"
                marginTop="6px"
                marginBottom="6px"
                key={menuName}>
                <Text
                  textAlign="center"
                  width="60%"
                  fontSize="md"
                  fontWeight={600}
                  lineHeight="sm"
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
      }

      if (cafeteriaName.includes('220동')) {
        return string
          .split('※')[0]
          .split('원 ')
          .map(item => {
            return item.split('&amp;').join('&').split(' ');
          })
          .map(menuAndPrice => {
            if (
              menuAndPrice.length !== 2 &&
              !menuAndPrice[0].includes('플러스메뉴')
            ) {
              return;
            }
            const [menuName, price] = menuAndPrice[0].includes('플러스메뉴')
              ? [refineMenuName(menuAndPrice[1]), menuAndPrice[2] + '원']
              : [refineMenuName(menuAndPrice[0]), menuAndPrice[1] + '원'];
            return (
              <HStack
                alignItems="center"
                marginTop="6px"
                marginBottom="6px"
                key={menuName}>
                <Text
                  textAlign="center"
                  width="60%"
                  fontSize="md"
                  fontWeight={600}
                  lineHeight="sm"
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
      }

      if (cafeteriaName.includes('감골')) {
        return string
          .split('※')[0]
          .split('원 ')
          .map(item => {
            return item
              .split('&amp;')
              .join('&')
              .split('&lt;')
              .join('<')
              .split('&gt;')
              .join('>')
              .split(' ');
          })
          .map(menuAndPrice => {
            if (menuAndPrice.length !== 2) {
              return;
            }
            const [menuName, price] = [
              refineMenuName(menuAndPrice[0]),
              menuAndPrice[1] + '원',
            ];
            return (
              <HStack
                alignItems="center"
                marginTop="6px"
                marginBottom="6px"
                key={menuName}>
                <Text
                  textAlign="center"
                  width="60%"
                  fontSize="md"
                  fontWeight={600}
                  lineHeight="sm"
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
      }

      if (cafeteriaName.includes('대학원')) {
        const matchedStrings = string.match(/[A-Z]|\(\d,\d\d\d원\)/gi);
        if (!matchedStrings) {
          return null;
        }

        return matchedStrings
          .map((priceSymbol, priceIndex) => {
            if (priceSymbol.length === 1) {
              return {
                parsedString:
                  string.split(/[A-Z]|\(\d,\d\d\d원\)/)[priceIndex + 1],
                price: `${(priceSymbol.charCodeAt(0) - 65) * 500 + 2000}원`,
              };
            } else {
              return {
                parsedString:
                  string.split(/[A-Z]|\(\d,\d\d\d원\)/)[priceIndex + 1],
                price: `${priceSymbol.slice(1, -2)}원`,
              };
            }
          })
          .map(({parsedString, price}) => {
            const menuName = refineMenuName(parsedString);

            return (
              <HStack
                alignItems="center"
                marginTop="6px"
                marginBottom="6px"
                key={menuName}>
                <Text
                  textAlign="center"
                  width="60%"
                  fontSize="md"
                  fontWeight={600}
                  lineHeight="sm"
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
      }

      if (cafeteriaName.includes('소담마루')) {
        return (
          <Text textAlign="center" width="70%" fontSize="lg">
            {string}
          </Text>
        );
      }

      if (cafeteriaName.includes('공간')) {
        return (
          <Text textAlign="center" width="100%" fontSize="xl">
            메뉴 정보 보기
          </Text>
        );
      }
      if (cafeteriaName.includes('301')) {
        return (
          <Text textAlign="center" width="100%" fontSize="md">
            {string
              .split('00원')
              .join('00원\n')
              .split('소반')
              .join('\n소반')
              .split('&amp;')
              .join('&\n')
              .split('&lt;')
              .join('\n<')
              .split('&gt;')
              .join('>\n')}
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
            {string}
          </Text>
        );
      }
      return string
        .split('원 ')
        .map(text => {
          return text.split('&amp;').join('&').split(' ');
        })
        .map(menuAndPrice => {
          if (menuAndPrice[0].includes('※')) {
            return;
          }
          const [menuName, price] = [
            refineMenuName(menuAndPrice[0]),
            menuAndPrice[1] + '원',
          ];
          return (
            <HStack
              alignItems="center"
              marginTop="6px"
              marginBottom="6px"
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
      const string = menu[cafeteriaName].lunch;
      if (
        string.includes('휴점') ||
        string.includes('폐점') ||
        string.includes('폐관')
      ) {
        return (
          <Text color="#888888" fontSize="lg" textAlign="center">
            {string}
          </Text>
        );
      } else {
        if (cafeteriaName.includes('301')) {
          return (
            <Text color="#888888" fontSize="lg" textAlign="center">
              교직원 식당만 운영
            </Text>
          );
        }
        if (nextTime === '추후') {
          // 운영 정보 없음
          <Text color="#888888" fontSize="lg" textAlign="center">
            운영 정보 없음
          </Text>;
        } else {
          return (
            <Text color="#888888" fontSize="lg" textAlign="center">
              {nextTime} 운영 예정
            </Text>
          );
        }
      }
    }
  }

  // const [checkStatus, setCheckStatus] = useState<Dictionary<{
  //   name: string;
  //   status: string;
  //   nextTime: string;
  //   operatingInfo: Dictionary<{
  //     when: string;
  //     time: string;
  //   }> | null;
  // }> | null>(null);

  const checkStatus = useMemo(() => {
    return chain(mealList)
      .map(cafeteriaName => {
        const [status, nextTime, operatingInfo] = checkOperating(
          cafeteriaName,
          cafeteria,
        );

        return {
          name: cafeteriaName,
          status,
          nextTime,
          operatingInfo: operatingInfo !== undefined ? operatingInfo : null, // 소담마루, 301 등 현재 운영 상태 비정상인 곳 에러 넘기기
        };
      })
      .keyBy('name')
      .value();
  }, [cafeteria, mealList]);

  function isOperating(name: string) {
    if (checkStatus === null || menu[name] === undefined) {
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
          {favoriteList
            .sort((a, b) => {
              return Number(isOperating(b)) - Number(isOperating(a));
            })
            .map(name => (
              <Center
                width="85%"
                // height={isOperating(name) ? '132px' : '72px'}
                minHeight="60px"
                paddingTop={2}
                paddingBottom={2}
                bg={isOperating(name) ? '#E9E7CE' : '#E2E2E2'}
                rounded={10}
                position="relative"
                marginBottom={4}
                shadow={0}
                key={name}>
                <Button
                  backgroundColor="transparent"
                  padding={0}
                  onPress={() => setSelectedMeal(name)}>
                  <HStack position="relative" padding={0}>
                    <Center
                      width="30%"
                      marginBottom={0}
                      padding={1}
                      bg="transparent"
                      rounded={15}>
                      <Text
                        color={colors.bage[200]}
                        fontWeight={800}
                        fontSize="xl"
                        textAlign="center">
                        {name === '대학원기숙사' ? '대학원\n기숙사' : name}
                      </Text>
                      {isOperating(name) ? (
                        <Text
                          color={colors.grey[400]}
                          textAlign="center"
                          marginTop={1}>
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
                        width="70%"
                        color="#888888"
                        fontSize="lg"
                        textAlign="center"
                        margin="auto">
                        운영 정보 없음
                      </Text>
                    )}
                  </HStack>
                </Button>
              </Center>
            ))}
        </Center>
        <Center marginTop={0} marginBottom={12} width="85%" alignSelf="center">
          <VStack width="100%">
            {chunk(
              nonFavoriteList.sort((a, b) => {
                return Number(isOperating(b)) - Number(isOperating(a));
              }),
              3,
            ).map(subnonFavoriteListInfoArray => {
              // not favorite meal 3줄로 나누기
              return (
                <HStack
                  key={subnonFavoriteListInfoArray[0]}
                  width="100%"
                  marginLeft="-2.5%">
                  {subnonFavoriteListInfoArray.map(name => {
                    return (
                      <AspectRatio
                        key={name}
                        width="30%"
                        ratio={1}
                        margin="2.5%">
                        <Button
                          onPress={() => setSelectedMeal(name)}
                          colorScheme="dark"
                          width="100%"
                          margin={0}
                          bg={colors.grey[100]} // isOperating
                          borderColor={colors.grey[200]}
                          borderWidth={1}
                          rounded={10}
                          padding={0}
                          key={name}>
                          <Text
                            color={
                              isOperating(name) ? colors.grey[400] : '#ABABAB'
                            }
                            fontSize="lg"
                            fontWeight={500}>
                            {name === '대학원기숙사' ? '대학원\n기숙사' : name}
                          </Text>
                        </Button>
                      </AspectRatio>
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
                    maxHeight="420px"
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
                              {checkStatus[selectedMeal].operatingInfo
                                ?.beforeBreakfast
                                ? checkStatus[selectedMeal].operatingInfo
                                    ?.beforeBreakfast.time +
                                  '~' +
                                  checkStatus[selectedMeal].operatingInfo
                                    ?.breakfast.time
                                : ''}
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
                            {checkStatus[selectedMeal].operatingInfo
                              ?.beforeLunch
                              ? checkStatus[selectedMeal].operatingInfo
                                  ?.beforeLunch.time +
                                '~' +
                                checkStatus[selectedMeal].operatingInfo?.lunch
                                  .time
                              : ''}
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
                              {checkStatus[selectedMeal].operatingInfo
                                ?.beforeDinner
                                ? checkStatus[selectedMeal].operatingInfo
                                    ?.beforeDinner.time +
                                  '~' +
                                  checkStatus[selectedMeal].operatingInfo
                                    ?.dinner.time
                                : ''}
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
                  <Text
                    height={20}
                    marginTop={10}
                    textAlign="center"
                    fontSize="lg">
                    운영 정보 없음
                  </Text>
                )}
              </Modal.Body>
            </Modal.Content>
          </Modal>
        ) : (
          <Text />
        )}
      </ScrollView>
    </VStack>
  );
}

const style = StyleSheet.create({});

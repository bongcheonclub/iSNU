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
  VStack,
  Modal,
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
import {MealData} from '../InitializeData/ProcessMealData';
import Text from '../components/Text';
import Button from '../components/Button';
import {theme} from '../ui/theme';

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

    const tempItem = await AsyncStorage.getItem('favoriteMeals');
    const storedFavoriteMealList =
      tempItem === undefined || tempItem === null ? [] : JSON.parse(tempItem);
    const newFavoriteList = (await storedFavoriteMealList.includes(name))
      ? storedFavoriteMealList.filter((item: string) => item !== name)
      : storedFavoriteMealList.concat(name);
    const newnonFavoriteList = mealList.filter(
      item => !newFavoriteList.includes(item),
    );
    await AsyncStorage.setItem(
      'favoriteMeals',
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
    return refinedMenuNameArray.join('').trim();
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
        .replace(/.파업/, '※')
        .split('※')[0]
        .split('00원')
        .map(item => {
          return item
            .trim()
            .split(/ *&amp; */)
            .join('&')
            .split(' ');
        })
        .map(menuAndPrice => {
          console.log(menuAndPrice);
          if (menuAndPrice.length !== 2) {
            return;
          }
          const [menuName, price] = [
            refineMenuName(menuAndPrice[0]),
            menuAndPrice[1] + '00원',
          ];
          return (
            <HStack
              alignItems="center"
              marginTop="6px"
              marginBottom="6px"
              key={menuName}>
              <Text textAlign="center" width="70%" variant="modalSubContent">
                {menuName}
              </Text>
              <Text textAlign="right" width="30%" variant="modalMenuPrice">
                {price}
              </Text>
            </HStack>
          );
        });
    }

    if (cafeteriaName.includes('예술계')) {
      return string
        .split('▶')[0]
        .split('원')
        .map(item => {
          return item
            .trim()
            .split(/ *&amp; */)
            .join('&\n')
            .split(' : ');
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
              <Text textAlign="center" width="70%" variant="modalSubContent">
                {menuName}
              </Text>
              <Text textAlign="right" width="30%" variant="modalMenuPrice">
                {price}
              </Text>
            </HStack>
          );
        });
    }

    if (cafeteriaName.includes('220동')) {
      return string
        .split('※')[0]
        .split('원')
        .map(item => {
          return item
            .trim()
            .split(/ *&amp; */)

            .join('&')
            .replace(/ *[/*|/&|/+] */, '+')
            .split(' ');
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
              <Text textAlign="center" width="70%" variant="modalSubContent">
                {menuName}
              </Text>
              <Text textAlign="right" width="30%" variant="modalMenuPrice">
                {price}
              </Text>
            </HStack>
          );
        });
    }

    if (cafeteriaName.includes('감골')) {
      return string
        .split('※')[0]
        .split('원')
        .map(item => {
          return item
            .trim()
            .split(/ *&amp; */)

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
                variant="modalSubContent"
                marginTop={2}>
                {menuName}
              </Text>
              <Text textAlign="right" width="30%" variant="modalMenuPrice">
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
            const rawPrice = (priceSymbol.charCodeAt(0) - 65) * 500 + 2000;
            const refinedPrice =
              floor(rawPrice / 1000) +
              ',' +
              (rawPrice % 1000 === 0 ? '000' : rawPrice % 1000);
            return {
              parsedString:
                string.split(/[A-Z]|\(\d,\d\d\d원\)/)[priceIndex + 1],
              price: `${refinedPrice}원`,
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
                marginTop={2}
                variant="modalSubContent">
                {menuName}
              </Text>
              <Text textAlign="right" width="30%" variant="modalMenuPrice">
                {price}
              </Text>
            </HStack>
          );
        });
    }

    if (cafeteriaName.includes('소담마루')) {
      return (
        <Text textAlign="center" width="100%" variant="modalSubContent">
          {string}
        </Text>
      );
    }

    if (cafeteriaName.includes('공간')) {
      return (
        <Text textAlign="center" width="100%" variant="modalSubContent">
          {string
            .split('00원')
            .join('00원\n')
            .split(/ *&amp; */)

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
        <Text textAlign="center" width="100%" variant="modalSubContent">
          {string
            .split('00원')
            .join('00원\n')
            .split('소반')
            .join('\n소반')
            .split(/ *&amp; */)

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
        <Text textAlign="center" variant="modalSubContent">
          휴무/휴점
        </Text>
      );
    }

    return string
      .replace(/.파업/, '※')
      .split('원')
      .map(text => {
        return text
          .trim()
          .split(/ *&amp; */)
          .join('&')
          .split(' ');
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
            <Text textAlign="center" width="70%" variant="modalSubContent">
              {menuName}
            </Text>
            <Text textAlign="right" width="30%" variant="modalMenuPrice">
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
          .replace(/.파업/, '※')
          .split('※')[0]
          .split('00원')
          .map(item => {
            return item
              .trim()
              .split(/ *&amp; */)
              .join('&')
              .split(' ');
          })
          .map(menuAndPrice => {
            console.log(menuAndPrice);
            if (menuAndPrice.length !== 2) {
              return;
            }
            const [menuName, price] = [
              refineMenuName(menuAndPrice[0]),
              menuAndPrice[1] + '00원',
            ];
            return (
              <HStack
                alignItems="center"
                marginTop="6px"
                marginBottom="6px"
                key={menuName}>
                <Text textAlign="center" width="60%" variant="favoriteMenuName">
                  {menuName}
                </Text>
                <Text
                  textAlign="center"
                  width="40%"
                  variant="favoriteMenuPrice">
                  {price}
                </Text>
              </HStack>
            );
          });
      }

      if (cafeteriaName.includes('예술계')) {
        return string
          .split('▶')[0]
          .split('원')
          .map(item => {
            return item
              .trim()
              .split(/ *&amp; */)
              .join('&')
              .trim()
              .split(' : ');
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
                <Text textAlign="center" width="60%" variant="favoriteMenuName">
                  {menuName}
                </Text>
                <Text
                  textAlign="center"
                  width="40%"
                  variant="favoriteMenuPrice">
                  {price}
                </Text>
              </HStack>
            );
          });
      }

      if (cafeteriaName.includes('220동')) {
        return string
          .split('※')[0]
          .split('원')
          .map(item => {
            return item
              .trim()
              .split(/ *&amp; */)

              .join('&')
              .replace(/ *[/*|/&|/+] */, '+')
              .split(' ');
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
                <Text textAlign="center" width="60%" variant="favoriteMenuName">
                  {menuName}
                </Text>
                <Text
                  textAlign="center"
                  width="40%"
                  variant="favoriteMenuPrice">
                  {price}
                </Text>
              </HStack>
            );
          });
      }

      if (cafeteriaName.includes('감골')) {
        return string
          .split('※')[0]
          .split('원')
          .map(item => {
            return item
              .trim()
              .split(/ *&amp; */)

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
                <Text textAlign="center" width="60%" variant="favoriteMenuName">
                  {menuName}
                </Text>
                <Text
                  textAlign="center"
                  width="40%"
                  variant="favoriteMenuPrice">
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
              const rawPrice = (priceSymbol.charCodeAt(0) - 65) * 500 + 2000;
              const refinedPrice =
                floor(rawPrice / 1000) +
                ',' +
                (rawPrice % 1000 === 0 ? '000' : rawPrice % 1000);
              return {
                parsedString:
                  string.split(/[A-Z]|\(\d,\d\d\d원\)/)[priceIndex + 1],
                price: `${refinedPrice}원`,
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
                <Text textAlign="center" width="60%" variant="favoriteMenuName">
                  {menuName}
                </Text>
                <Text
                  textAlign="center"
                  width="40%"
                  variant="favoriteMenuPrice">
                  {price}
                </Text>
              </HStack>
            );
          });
      }

      if (cafeteriaName.includes('소담마루')) {
        return (
          <Text textAlign="center" width="100%" variant="favoritePlaceTime">
            {string}
          </Text>
        );
      }

      if (cafeteriaName.includes('공간')) {
        return (
          <Text textAlign="center" width="100%" variant="favoriteMenuName">
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
              .split(/ *&amp; */)

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
          <Text textAlign="center" width="100%" variant="favoritePlaceTime">
            {string}
          </Text>
        );
      }
      return string
        .replace(/.파업/, '※')
        .split('원')
        .map(text => {
          return text
            .trim()
            .split(/ *&amp; */)
            .join('&')
            .split(' ');
        })
        .map(menuAndPrice => {
          console.log(menuAndPrice);
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
              <Text textAlign="center" width="60%" variant="favoriteMenuName">
                {menuName}
              </Text>
              <Text textAlign="center" width="40%" variant="favoriteMenuPrice">
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
          <Text variant="favoritePlaceTime" textAlign="center">
            {string}
          </Text>
        );
      } else {
        if (cafeteriaName.includes('301')) {
          return (
            <Text variant="favoritePlaceTime" textAlign="center">
              교직원 식당만 운영
            </Text>
          );
        }
        if (nextTime === '추후') {
          <Text variant="favoritePlaceTime" textAlign="center">
            운영 정보 없음
          </Text>;
        } else {
          return (
            <Text variant="favoritePlaceTime" textAlign="center">
              {nextTime} 운영 예정
            </Text>
          );
        }
      }
    }
  }

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

  return (
    <VStack>
      <ScrollView bgColor={theme.colors.white} height="100%">
        <Center marginTop={2.5}>
          {favoriteList
            .sort((a, b) => {
              return Number(isOperating(b)) - Number(isOperating(a));
            })
            .map(name => (
              <Center
                width="85%"
                minHeight="60px"
                position="relative"
                marginBottom="15px"
                key={name}>
                <Button
                  variant={
                    isOperating(name)
                      ? 'favoriteOpenPlace'
                      : 'favoriteClosedPlace'
                  }
                  py="10px"
                  px="0px"
                  onPress={() => setSelectedMeal(name)}>
                  <HStack position="relative" padding={0}>
                    <Center width="35%" marginBottom={0} bg="transparent">
                      <Text variant="favoritePlaceNameBig" textAlign="center">
                        {name === '대학원기숙사' ? '대학원\n기숙사' : name}
                      </Text>
                      {isOperating(name) ? (
                        <Text
                          variant="favoritePlaceTime"
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
                      <Center width="65%" padding={0}>
                        {showFavoriteMenu(name)}
                      </Center>
                    ) : (
                      <Text
                        width="65%"
                        variant="favoritePlaceTime"
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
        <Center marginTop={0} width="85%" alignSelf="center">
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
                        mx="2.5%"
                        marginBottom="5%">
                        <Button
                          onPress={() => setSelectedMeal(name)}
                          width="100%"
                          margin={0}
                          variant="place"
                          padding={0}
                          key={name}>
                          <Text
                            variant={
                              isOperating(name)
                                ? 'normalOpenPlaceSmall'
                                : 'normalClosedPlaceSmall'
                            }>
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
                      <Text marginBottom={1} variant="modalTitle">
                        {selectedMeal}
                      </Text>
                      <Button
                        bgColor="transparent"
                        left={-6}
                        top={-1}
                        onPress={() => editFavoriteList(String(selectedMeal))}>
                        {favoriteList.includes(selectedMeal) ? (
                          <FilledStar />
                        ) : (
                          <UnfilledStar />
                        )}
                      </Button>
                    </HStack>
                    <Text variant="modalSubInfo" left={-15} top={-20}>
                      {cafeteria[selectedMeal].location}
                    </Text>
                    <Text variant="modalToday" textAlign="center" marginTop={3}>
                      {month}월 {date}일 ({koreanDay})
                    </Text>
                  </Box>
                ) : (
                  <></>
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
                            <Text textAlign="center" variant="modalSubContent">
                              아침
                            </Text>
                            <>
                              {checkStatus[selectedMeal].operatingInfo
                                ?.beforeBreakfast ? (
                                <Text
                                  textAlign="center"
                                  variant="modalMenuTime">
                                  {checkStatus[selectedMeal].operatingInfo
                                    ?.beforeBreakfast.time +
                                    '~' +
                                    checkStatus[selectedMeal].operatingInfo
                                      ?.breakfast.time}
                                </Text>
                              ) : (
                                <></>
                              )}
                            </>
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
                      <></>
                    )}

                    {menu[selectedMeal].lunch.length > 0 ? (
                      <HStack>
                        <VStack width="25%" justifyContent="center">
                          <Text textAlign="center" variant="modalSubContent">
                            점심
                          </Text>
                          <>
                            {checkStatus[selectedMeal].operatingInfo
                              ?.beforeLunch ? (
                              <Text textAlign="center" variant="modalMenuTime">
                                {checkStatus[selectedMeal].operatingInfo
                                  ?.beforeLunch.time +
                                  '~' +
                                  checkStatus[selectedMeal].operatingInfo?.lunch
                                    .time}
                              </Text>
                            ) : (
                              <></>
                            )}
                          </>
                        </VStack>
                        <VStack width="75%">
                          {showMenu(selectedMeal, 'lunch')}
                        </VStack>
                      </HStack>
                    ) : (
                      <></>
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
                            <Text textAlign="center" variant="modalSubContent">
                              저녁
                            </Text>
                            <>
                              {checkStatus[selectedMeal].operatingInfo
                                ?.beforeDinner ? (
                                <Text
                                  textAlign="center"
                                  variant="modalMenuTime">
                                  {checkStatus[selectedMeal].operatingInfo
                                    ?.beforeDinner.time +
                                    '~' +
                                    checkStatus[selectedMeal].operatingInfo
                                      ?.dinner.time}
                                </Text>
                              ) : (
                                <></>
                              )}
                            </>
                          </VStack>
                          <VStack width="75%">
                            {showMenu(selectedMeal, 'dinner')}
                          </VStack>
                        </HStack>
                      </>
                    ) : (
                      <></>
                    )}
                  </ScrollView>
                ) : (
                  <Text
                    height={20}
                    marginTop={10}
                    textAlign="center"
                    variant="modalSubContent">
                    운영 정보 없음
                  </Text>
                )}
              </Modal.Body>
            </Modal.Content>
          </Modal>
        ) : (
          <></>
        )}
      </ScrollView>
    </VStack>
  );
}

const style = StyleSheet.create({});

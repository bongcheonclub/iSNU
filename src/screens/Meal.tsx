import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState} from 'react';
import {
  Box,
  Center,
  HStack,
  ScrollView,
  VStack,
  Modal,
  Divider,
  AspectRatio,
} from 'native-base';
import {chain, chunk, Dictionary, floor} from 'lodash';
import {
  compareAsc,
  getDate,
  getDay,
  getMonth,
  getYear,
  parse as parseTime,
} from 'date-fns';
import FilledStarIcon from '../icons/filled-star.svg';
import UnfilledStarIcon from '../icons/unfilled-star.svg';
import TomorrowIcon from '../icons/tomorrow.svg';
import YesterdayIcon from '../icons/yesterday.svg';
import {MealData, Menu} from '../InitializeData/ProcessMealData';
import Text from '../components/Text';
import {theme} from '../ui/theme';
import Button from '../components/WrappedButton';

type Props = {
  mealData: MealData;
};

// type Offset = 0 | 1 | 2 | -1 | -2;

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
  const now = new Date('Tue Oct 26 2021 12:24:15 GMT+0900');
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

export default function Meal({mealData}: Props) {
  const {
    day0Menu,
    day1Menu,
    day2Menu,
    day_1Menu,
    day_2Menu,
    cafeteria,
    mealList,
    favoriteList: initialFavoriteList,
    nonFavoriteList: initialNonFavoriteList,
    year,
    month,
    date,
    koreanDay,
  } = mealData;

  const [selectedDateOffset, setSelectedDateOffset] = useState<number>(0);

  const [selectedMeal, setSelectedMeal] = useState<string | null>(null); // store selected meal (modal) here

  const [favoriteList, setFavoriteList] =
    useState<string[]>(initialFavoriteList);
  const [nonFavoriteList, setNonFavoriteList] = useState<string[]>(
    initialNonFavoriteList,
  );

  function getDisplayDate(
    thisYear: number,
    thisMonth: number,
    thisDate: number,
    offset: number,
  ): string {
    const _displayDay = new Date(thisYear, thisMonth - 1, thisDate + offset);
    const _month = getMonth(_displayDay) + 1;
    const _date = getDate(_displayDay);
    const _day = getDay(_displayDay);
    const _koreanDay = (() => {
      if (_day === 0) {
        return '일';
      }
      if (_day === 1) {
        return '월';
      }
      if (_day === 2) {
        return '화';
      }
      if (_day === 3) {
        return '수';
      }
      if (_day === 4) {
        return '목';
      }
      if (_day === 5) {
        return '금';
      }
      if (_day === 6) {
        return '토';
      }
      throw Error('이럴리없다.');
    })();
    const _displayDate = `${_month}월 ${_date}일 (${_koreanDay})`;
    return _displayDate;
  }
  const displayDate = getDisplayDate(year, month, date, selectedDateOffset);

  const menus: any = {
    0: day0Menu,
    1: day1Menu,
    2: day2Menu,
    [-1]: day_1Menu,
    [-2]: day_2Menu,
  };
  const todaysMenu: Menu = menus[0];
  const menu: Menu = menus[selectedDateOffset];

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
    const splitedText = rawText
      .split(/\+|&|\*/)
      .map((item: string) => item.trim());
    const refinedMenuNameArray: string[] = [];
    splitedText.forEach(item => {
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
    const contents = menus[selectedDateOffset][cafeteriaName][whichMenu];
    if (typeof contents === 'string') {
      return <Text textAlign="center">{contents}</Text>;
    }

    return contents.map(item => {
      if (item === undefined) {
        return null;
      }
      return (
        <HStack
          alignItems="center"
          marginTop="6px"
          marginBottom="6px"
          key={item[0]}>
          <Text textAlign="center" width="70%" variant="modalSubContent">
            {item[0]}
          </Text>
          <Text textAlign="right" width="30%" variant="modalMenuPrice">
            {item[1]}
          </Text>
        </HStack>
      );
    });
  }

  function showFavoriteMenu(cafeteriaName: string) {
    if (checkStatus === null || todaysMenu === null) {
      return <Text>Loading</Text>;
    }
    const [status, nextTime] = [
      checkStatus[cafeteriaName].status,
      checkStatus[cafeteriaName].nextTime,
    ];
    if (status === 'breakfast' || status === 'lunch' || status === 'dinner') {
      const string = todaysMenu[cafeteriaName][status];

      if (cafeteriaName.includes('두레미담')) {
        return (
          <Text textAlign="center" width="100%" variant="favoriteMenuName">
            메뉴 정보 보기
          </Text>
        );
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
      const contents = todaysMenu[cafeteriaName][status];
      if (typeof contents === 'string') {
        return <Text textAlign="center">{contents}</Text>;
      }

      return contents.map(item => {
        if (item === undefined) {
          return null;
        }
        return (
          <HStack
            alignItems="center"
            marginTop="6px"
            marginBottom="6px"
            key={item[0]}>
            <Text textAlign="center" width="60%" variant="favoriteMenuName">
              {item[0]}
            </Text>
            <Text textAlign="center" width="40%" variant="favoriteMenuPrice">
              {item[1]}
            </Text>
          </HStack>
        );
      });
    } else {
      const string = todaysMenu[cafeteriaName].lunch;
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
              교직원 식당만 운영{'\n'}11:30-13:10
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

  const checkStatus = chain(mealList)
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

  function isOperating(name: string) {
    if (checkStatus === null || todaysMenu[name] === undefined) {
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
            .map(name => {
              const isOperatingMeal = isOperating(name);
              return (
                <Center
                  width="85%"
                  minHeight="60px"
                  position="relative"
                  marginBottom="15px"
                  key={name}>
                  <Button
                    tags={{name, isOpearting: isOperatingMeal, favorite: true}}
                    label="meal-detail"
                    variant={
                      isOperatingMeal
                        ? 'favoriteOpenPlace'
                        : 'favoriteClosedPlace'
                    }
                    py="10px"
                    px="0px"
                    onPress={() => setSelectedMeal(name)}>
                    <HStack position="relative" padding={0}>
                      <Center width="34%" marginBottom={0} bg="transparent">
                        <Text variant="favoritePlaceNameBig" textAlign="center">
                          {name === '대학원기숙사' ? '대학원\n기숙사' : name}
                        </Text>
                        {isOperatingMeal ? (
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
                      {todaysMenu !== null &&
                      name !== null &&
                      todaysMenu[name] !== undefined ? (
                        <Center width="66%" padding={0}>
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
              );
            })}
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
                    const isOperatingMeal = isOperating(name);
                    return (
                      <AspectRatio
                        key={name}
                        width="30%"
                        ratio={1}
                        mx="2.5%"
                        marginBottom="5%">
                        <Button
                          label="meal-detail"
                          tags={{
                            name,
                            isOpearting: isOperatingMeal,
                            favorite: false,
                          }}
                          onPress={() => setSelectedMeal(name)}
                          width="100%"
                          margin={0}
                          variant="place"
                          padding={0}
                          key={name}>
                          <Text
                            textAlign="center"
                            variant={
                              isOperatingMeal
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
            onClose={() => {
              setSelectedMeal(null);
              setSelectedDateOffset(0);
            }}>
            <Modal.Content
              paddingTop="8px"
              px="12px"
              paddingBottom="12px"
              width="90%">
              <Modal.CloseButton />
              {selectedMeal !== null ? (
                <Box margin={6} marginBottom={1}>
                  <HStack left={-15} top={-15}>
                    <Text marginBottom={1} variant="modalTitle">
                      {selectedMeal}
                    </Text>
                    <Button
                      label="meal-toggle-favorite"
                      tags={{
                        name: selectedMeal,
                        isFavorite: favoriteList.includes(selectedMeal),
                      }}
                      bgColor="transparent"
                      left={-6}
                      top={-1}
                      onPress={() => editFavoriteList(String(selectedMeal))}>
                      {favoriteList.includes(selectedMeal) ? (
                        <FilledStarIcon />
                      ) : (
                        <UnfilledStarIcon />
                      )}
                    </Button>
                  </HStack>
                  <Text variant="modalSubInfo" left={-15} top={-20}>
                    {cafeteria[selectedMeal].location}
                  </Text>
                  <HStack
                    w="100%"
                    alignItems="center"
                    justifyContent="center"
                    marginY={2}>
                    {selectedMeal.includes('대학원') ||
                    selectedDateOffset === -2 ? null : (
                      <Button
                        position="absolute"
                        left="44px"
                        label={'prevDate'}
                        backgroundColor="transparent"
                        onPress={() => {
                          setSelectedDateOffset(selectedDateOffset - 1);
                        }}>
                        <YesterdayIcon />
                      </Button>
                    )}
                    <Text
                      variant="modalToday"
                      textAlign="center"
                      position="absolute">
                      {displayDate}
                    </Text>
                    {selectedMeal.includes('대학원') ||
                    selectedDateOffset === 2 ? null : (
                      <Button
                        position="absolute"
                        right="44px"
                        label={'nextDate'}
                        backgroundColor="transparent"
                        onPress={() => {
                          setSelectedDateOffset(selectedDateOffset + 1);
                        }}>
                        <TomorrowIcon />
                      </Button>
                    )}
                  </HStack>
                </Box>
              ) : (
                <></>
              )}
              {selectedMeal !== null && menu[selectedMeal] !== undefined ? (
                <ScrollView
                  margin={5}
                  marginLeft={3}
                  marginRight={3}
                  maxHeight="420px"
                  bounces={false}>
                  {console.log(menu[selectedMeal])}
                  {menu[selectedMeal].breakfast.length > 1 ? (
                    <>
                      <HStack>
                        <VStack width="25%" justifyContent="center">
                          <Text textAlign="center" variant="modalSubContent">
                            아침
                          </Text>
                          <>
                            {checkStatus[selectedMeal].operatingInfo
                              ?.beforeBreakfast ? (
                              <Text textAlign="center" variant="modalMenuTime">
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

                  {menu[selectedMeal].lunch.length > 1 ? (
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
                  {menu[selectedMeal].dinner.length > 1 ? (
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
                              <Text textAlign="center" variant="modalMenuTime">
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
            </Modal.Content>
          </Modal>
        ) : (
          <></>
        )}
      </ScrollView>
    </VStack>
  );
}

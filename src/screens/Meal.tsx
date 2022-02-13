import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useCallback, useMemo, useState} from 'react';
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
import {chain, chunk, Dictionary} from 'lodash';
import {
  addDays,
  compareAsc,
  getDate,
  getDay,
  getMonth,
  parse as parseTime,
} from 'date-fns';
import FilledStarIcon from '../icons/filled-star.svg';
import UnfilledStarIcon from '../icons/unfilled-star.svg';
import TomorrowIcon from '../icons/tomorrow.svg';
import YesterdayIcon from '../icons/yesterday.svg';
import {MealData, RefinedMenu} from '../InitializeData/ProcessMealData';
import Text from '../components/Text';
import {theme} from '../ui/theme';
import Button from '../components/WrappedButton';
import {convertToKoreanDay} from '../helpers/convertToKoreanDay';
import {getIsHoliday} from '../helpers/isHoliday';

type Props = {
  mealData: MealData;
  nowDate: Date;
};

function checkOperating(
  cafeteriaName: string,
  cafeteria: MealData['cafeteria'],
  selectedDate: Date,
  nowDate: Date,
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
  const spliter = cafeteriaName.includes('감골') ? '~' : '-';
  const today = (() => {
    switch (
      getIsHoliday(selectedDate) ? 0 : getDay(selectedDate) // day
    ) {
      case 0: // sunday
        return 'holiday';
      case 6: // saturday
        return 'saturday';
      default:
        return 'weekday';
    }
  })();
  const tomorrow = (() => {
    const tomorrowDate = addDays(selectedDate, 1);
    switch (
      getIsHoliday(tomorrowDate) ? 0 : getDay(tomorrowDate) // day
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
  const tomorrowStartTime = cafeteria[cafeteriaName][tomorrow]
    .split(' ')
    .filter(item => item[0] !== '(' && item[-1] !== ')' && item.includes('0'))
    .join(spliter)
    .split(spliter)[0];

  if (rawData === '휴관' || rawData === '휴점 중' || rawData === '') {
    const nextTime =
      tomorrowStartTime !== '' ? '내일 ' + tomorrowStartTime : '추후';
    return ['end', nextTime];
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
      const startAt = parseTime(startAtString, 'HH:mm', nowDate);
      const endedAt = parseTime(endedAtString, 'HH:mm', nowDate);
      if (
        compareAsc(startAt, nowDate) <= 0 &&
        compareAsc(nowDate, endedAt) < 0
      ) {
        return true;
      }
    }) ?? 'end';

  const indexOfResult = results.indexOf(result);

  if (indexOfResult === -1) {
    const nextTime =
      tomorrowStartTime !== '' ? '내일 ' + tomorrowStartTime : '추후';
    return [result, nextTime, operatingInfo];
  } else {
    return [result, times[indexOfResult + 1], operatingInfo];
  }
}

export default function Meal({mealData, nowDate}: Props) {
  const {
    dayBefore2Menu,
    dayBefore1Menu,
    day0Menu,
    dayAfter1Menu,
    dayAfter2Menu,
    cafeteria,
    mealList,
    favoriteList: initialFavoriteList,
    nonFavoriteList: initialNonFavoriteList,
  } = mealData;

  const [selectedDateOffset, setSelectedDateOffset] = useState<number>(0);

  const [selectedMeal, setSelectedMeal] = useState<string | null>(null); // store selected meal (modal) here

  const [favoriteList, setFavoriteList] =
    useState<string[]>(initialFavoriteList);
  const [nonFavoriteList, setNonFavoriteList] = useState<string[]>(
    initialNonFavoriteList,
  );

  const selectedDate = useMemo(
    () => addDays(nowDate, selectedDateOffset),
    [nowDate, selectedDateOffset],
  );

  function getDisplayDate(specificDate: Date): string {
    const m = getMonth(specificDate) + 1;
    const d = getDate(specificDate);
    const day = getDay(specificDate);
    const koreanDay = convertToKoreanDay(day);
    const displayDateText = `${m}월 ${d}일 (${koreanDay})`;
    return displayDateText;
  }

  const displayDate = useMemo(
    () => getDisplayDate(selectedDate),
    [selectedDate],
  );

  const menus: {[key: number]: RefinedMenu} = {
    [-2]: dayBefore2Menu,
    [-1]: dayBefore1Menu,
    0: day0Menu,
    1: dayAfter1Menu,
    2: dayAfter2Menu,
  };
  const todaysMenu = menus[0];
  const menu = menus[selectedDateOffset];

  // 즐겨찾기 설정 해제 함수

  const editFavoriteList = useCallback(
    async (name: string) => {
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
    },
    [mealList],
  );

  function showMenuInModal(
    cafeteriaName: string,
    whichMenu: 'breakfast' | 'lunch' | 'dinner',
  ) {
    const contents = menus[selectedDateOffset][cafeteriaName][whichMenu];
    if (typeof contents === 'string') {
      return (
        <HStack alignItems="center" marginTop="6px" marginBottom="6px">
          <Text textAlign="center" width="100%" variant="modalSubContent">
            {contents}
          </Text>
        </HStack>
      );
    }

    return contents.map(item => {
      if (item === undefined || item === null) {
        return null;
      }
      return (
        <HStack
          alignItems="center"
          marginTop="6px"
          marginBottom="6px"
          key={item.menuName}>
          <Text textAlign="center" width="70%" variant="modalSubContent">
            {item.menuName}
          </Text>
          <Text textAlign="right" width="30%" variant="modalSubContent">
            {item.price}
          </Text>
        </HStack>
      );
    });
  }

  const checkStatus = chain(mealList)
    .map(cafeteriaName => {
      const [status, nextTime, operatingInfo] = checkOperating(
        cafeteriaName,
        cafeteria,
        selectedDate,
        nowDate,
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

  const checkTodayStatus = chain(mealList)
    .map(cafeteriaName => {
      const [status, nextTime, operatingInfo] = checkOperating(
        cafeteriaName,
        cafeteria,
        nowDate,
        nowDate,
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

  function showFavoriteMenu(cafeteriaName: string) {
    if (checkTodayStatus === null || todaysMenu === null) {
      return <Text>Loading</Text>;
    }
    const [status, nextTime] = [
      checkTodayStatus[cafeteriaName].status,
      checkTodayStatus[cafeteriaName].nextTime,
    ];

    if (todaysMenu[cafeteriaName] === undefined) {
      if (menus[1][cafeteriaName] === undefined || nextTime === '추후') {
        return (
          <Text variant="favoriteClosedInfo" textAlign="center">
            추후 운영 예정
          </Text>
        );
      } else {
        return (
          <Text variant="favoriteClosedInfo" textAlign="center">
            {nextTime} 운영 예정
          </Text>
        );
      }
    }

    if (status === 'breakfast' || status === 'lunch' || status === 'dinner') {
      const textFormMenu = todaysMenu[cafeteriaName][status];

      if (
        cafeteriaName.includes('두레미담') ||
        cafeteriaName.includes('공간')
      ) {
        return (
          <Text textAlign="center" width="100%" variant="favoriteMenuName">
            메뉴 정보 보기
          </Text>
        );
      }

      if (cafeteriaName.includes('소담마루')) {
        return (
          <Text textAlign="center" width="100%" variant="favoriteClosedInfo">
            {textFormMenu}
          </Text>
        );
      }

      if (cafeteriaName.includes('301')) {
        return (
          <Text textAlign="center" width="100%" variant="favoriteMenuName">
            {(textFormMenu as string)
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
        (textFormMenu as string).includes('휴무') ||
        (textFormMenu as string).includes('휴관') ||
        (textFormMenu as string).includes('휴점') ||
        (textFormMenu as string).includes('폐점') ||
        (textFormMenu as string).includes('미운영')
      ) {
        return (
          <Text textAlign="center" width="100%" variant="favoriteClosedInfo">
            {textFormMenu}
          </Text>
        );
      } else if (
        typeof textFormMenu === 'string' &&
        (textFormMenu as string).trim() === ''
      ) {
        return (
          <Text textAlign="center" width="100%" variant="favoriteClosedInfo">
            메뉴 정보 없음
          </Text>
        );
      }
      const contents = todaysMenu[cafeteriaName][status];
      if (typeof contents === 'string') {
        return (
          <Text textAlign="center" width="100%" variant="favoriteClosedInfo">
            {contents}
          </Text>
        );
      }

      return contents.map(item => {
        if (item === undefined || item === null) {
          return null;
        }
        return (
          <HStack
            alignItems="center"
            marginTop="6px"
            marginBottom="6px"
            key={item.menuName}>
            <Text textAlign="center" width="60%" variant="favoriteMenuName">
              {item.menuName}
            </Text>
            <Text textAlign="center" width="40%" variant="favoriteMenuPrice">
              {item.price}
            </Text>
          </HStack>
        );
      });
    } else {
      const textFormMenu = todaysMenu[cafeteriaName].lunch;
      if (
        (textFormMenu as string).includes('휴무') ||
        (textFormMenu as string).includes('휴점') ||
        (textFormMenu as string).includes('폐점') ||
        (textFormMenu as string).includes('폐관') ||
        (textFormMenu as string).includes('미운영')
      ) {
        if (nextTime !== '추후') {
          return (
            <Text variant="favoriteClosedInfo" textAlign="center">
              {nextTime} 운영 예정
            </Text>
          );
        }
        return (
          <Text variant="favoriteClosedInfo" textAlign="center">
            {textFormMenu}
          </Text>
        );
      } else {
        if (cafeteriaName.includes('301')) {
          return (
            <Text variant="favoriteClosedInfo" textAlign="center">
              교직원 식당만 운영{'\n'}11:30-13:10
            </Text>
          );
        }
        if (nextTime === '추후') {
          return (
            <Text variant="favoriteClosedInfo" textAlign="center">
              운영 종료
            </Text>
          );
        } else {
          return (
            <Text variant="favoriteClosedInfo" textAlign="center">
              {nextTime} 운영 예정
            </Text>
          );
        }
      }
    }
  }

  function isOperatingNow(name: string) {
    if (checkTodayStatus === null || todaysMenu[name] === undefined) {
      return false;
    }
    if (
      checkTodayStatus[name].status === 'breakfast' ||
      checkTodayStatus[name].status === 'lunch' ||
      checkTodayStatus[name].status === 'dinner'
    ) {
      return true;
    } else {
      return false;
    }
  }

  const FavoritedMeal = function (props: {name: string}) {
    const isOperatingMeal = isOperatingNow(props.name);
    const handleSelectedMeal = useCallback(
      () => setSelectedMeal(props.name),
      [props.name],
    );
    const favoritedMealButtonTags = useMemo(() => {
      return {
        name: props.name,
        isOpearting: isOperatingMeal,
        favorite: true,
      };
    }, [props.name, isOperatingMeal]);
    return (
      <Center
        width="85%"
        position="relative"
        marginBottom="15px"
        key={props.name}>
        <Button
          tags={favoritedMealButtonTags}
          label="meal-detail"
          variant="favoritePlace"
          py="10px"
          px="0px"
          onPress={handleSelectedMeal}>
          <HStack position="relative" padding={0}>
            <Center width="34%" marginBottom={0} bg="transparent">
              <Text
                variant={
                  isOperatingMeal
                    ? 'favoriteOpenPlaceNameBig'
                    : 'favoriteClosedPlaceNameBig'
                }
                textAlign="center">
                {props.name === '대학원기숙사' ? '대학원\n기숙사' : props.name}
              </Text>
              {isOperatingMeal ? (
                <Text
                  variant="favoritePlaceTime"
                  textAlign="center"
                  marginTop={1}>
                  ~{checkTodayStatus[props.name].nextTime}
                </Text>
              ) : null}
            </Center>
            {todaysMenu !== null && props.name !== null && (
              <Center width="66%" padding={0}>
                {showFavoriteMenu(props.name)}
              </Center>
            )}
          </HStack>
        </Button>
      </Center>
    );
  };

  const NotFavoriteMeal = function (props: {name: string}) {
    const isOperatingMeal = isOperatingNow(props.name);
    const notFavoriteMealTags = useMemo(() => {
      return {
        name: props.name,
        isOpearting: isOperatingMeal,
        favorite: false,
      };
    }, [props.name, isOperatingMeal]);
    const handleSelectedMeal = useCallback(
      () => setSelectedMeal(props.name),
      [props.name],
    );
    return (
      <AspectRatio
        key={props.name}
        width="30%"
        ratio={1}
        mx="2.5%"
        marginBottom="5%">
        <Button
          label="meal-detail"
          tags={notFavoriteMealTags}
          onPress={handleSelectedMeal}
          width="100%"
          margin={0}
          variant="normalPlace"
          padding={0}
          key={props.name}>
          <Text
            textAlign="center"
            variant={
              isOperatingMeal
                ? 'normalOpenPlaceSmall'
                : 'normalClosedPlaceSmall'
            }>
            {props.name === '대학원기숙사' ? '대학원\n기숙사' : props.name}
          </Text>
        </Button>
      </AspectRatio>
    );
  };

  const hadnleModalClose = useCallback(() => {
    setSelectedMeal(null);
    setSelectedDateOffset(0);
  }, []);

  const handleFavoriteButton = useCallback(
    () => editFavoriteList(String(selectedMeal)),
    [editFavoriteList, selectedMeal],
  );

  const handleYesterdayButton = useCallback(() => {
    setSelectedDateOffset(selectedDateOffset - 1);
  }, [selectedDateOffset]);

  const handleTomorrowButton = useCallback(() => {
    setSelectedDateOffset(selectedDateOffset + 1);
  }, [selectedDateOffset]);

  const toggleFavoriteMealTag = useMemo(() => {
    return {
      name: selectedMeal,
      isFavorite: favoriteList.includes(selectedMeal as string),
    };
  }, [favoriteList, selectedMeal]);

  return (
    <VStack>
      <ScrollView bgColor={theme.colors.white} height="100%">
        <Center marginTop="15px">
          {favoriteList
            .sort((a, b) => {
              return Number(isOperatingNow(b)) - Number(isOperatingNow(a));
            })
            .map(name => {
              return <FavoritedMeal name={name} key={name} />;
            })}
        </Center>
        <Center marginTop={0} width="85%" alignSelf="center">
          <VStack width="100%">
            {chunk(
              nonFavoriteList.sort((a, b) => {
                return Number(isOperatingNow(b)) - Number(isOperatingNow(a));
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
                    return <NotFavoriteMeal name={name} key={name} />;
                  })}
                </HStack>
              );
            })}
          </VStack>
        </Center>
        {selectedMeal && (
          <Modal // modal 구현
            isOpen={selectedMeal !== null}
            onClose={hadnleModalClose}>
            <Modal.Content
              paddingTop="8px"
              px="12px"
              paddingBottom="12px"
              width="90%">
              <Modal.CloseButton />
              <Box margin={6} marginBottom={1}>
                <HStack left={-15} top={-15}>
                  <Text marginBottom={1} variant="modalTitle">
                    {selectedMeal}
                  </Text>
                  <Button
                    label="meal-toggle-favorite"
                    tags={toggleFavoriteMealTag}
                    bgColor="transparent"
                    left={-6}
                    top={-1}
                    onPress={handleFavoriteButton}>
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
                      left="39px"
                      w="30px"
                      h="30px"
                      padding="0"
                      label={'prevDate'}
                      variant="changeMenuDateButton"
                      onPress={handleYesterdayButton}>
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
                      right="39px"
                      w="30px"
                      h="30px"
                      padding="0"
                      label={'nextDate'}
                      variant="changeMenuDateButton"
                      onPress={handleTomorrowButton}>
                      <TomorrowIcon />
                    </Button>
                  )}
                </HStack>
              </Box>
              {menu[selectedMeal] !== undefined ? (
                <ScrollView
                  margin={5}
                  marginLeft={3}
                  marginRight={3}
                  maxHeight="420px"
                  bounces={false}>
                  {menu[selectedMeal].breakfast.length > 1 ||
                  (selectedMeal === '대학원기숙사' &&
                    menu[selectedMeal].breakfast.length > 0) ? (
                    <>
                      <HStack alignItems="center">
                        <VStack width="25%" justifyContent="center">
                          <Text textAlign="center" variant="modalSubContent">
                            아침
                          </Text>
                          {checkStatus[selectedMeal].operatingInfo
                            ?.beforeBreakfast && (
                            <Text textAlign="center" variant="modalMenuTime">
                              {checkStatus[selectedMeal].operatingInfo
                                ?.beforeBreakfast.time +
                                '~' +
                                checkStatus[selectedMeal].operatingInfo
                                  ?.breakfast.time}
                            </Text>
                          )}
                        </VStack>
                        <VStack width="75%">
                          {showMenuInModal(selectedMeal, 'breakfast')}
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
                  ) : null}

                  {menu[selectedMeal].lunch.length > 1 ||
                  (selectedMeal === '대학원기숙사' &&
                    menu[selectedMeal].lunch.length > 0) ? (
                    <HStack>
                      <VStack width="25%" justifyContent="center">
                        <Text textAlign="center" variant="modalSubContent">
                          점심
                        </Text>
                        {checkStatus[selectedMeal].operatingInfo
                          ?.beforeLunch && (
                          <Text textAlign="center" variant="modalMenuTime">
                            {checkStatus[selectedMeal].operatingInfo
                              ?.beforeLunch.time +
                              '~' +
                              checkStatus[selectedMeal].operatingInfo?.lunch
                                .time}
                          </Text>
                        )}
                      </VStack>
                      <VStack width="75%">
                        {showMenuInModal(selectedMeal, 'lunch')}
                      </VStack>
                    </HStack>
                  ) : null}
                  {menu[selectedMeal].dinner.length > 1 ||
                  (selectedMeal === '대학원기숙사' &&
                    menu[selectedMeal].dinner.length > 0) ? (
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
                          {checkStatus[selectedMeal].operatingInfo
                            ?.beforeDinner && (
                            <Text textAlign="center" variant="modalMenuTime">
                              {checkStatus[selectedMeal].operatingInfo
                                ?.beforeDinner.time +
                                '~' +
                                checkStatus[selectedMeal].operatingInfo?.dinner
                                  .time}
                            </Text>
                          )}
                        </VStack>
                        <VStack width="75%">
                          {showMenuInModal(selectedMeal, 'dinner')}
                        </VStack>
                      </HStack>
                    </>
                  ) : null}
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
        )}
      </ScrollView>
    </VStack>
  );
}

import {chain, map} from 'lodash';
import {Dimensions} from 'react-native';
import {
  Box,
  Center,
  HStack,
  ScrollView,
  Text,
  VStack,
  Button,
  Modal,
  Flex,
  Divider,
} from 'native-base';
import FilledStar from '../icons/filled-star.svg';
import UnfilledStar from '../icons/unfilled-star.svg';
import React, {useEffect, useState} from 'react';
import {colors} from '../ui/colors';
import {Cafe} from '../screens/Cafe';
import {Mart} from '../screens/Mart';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AvailableItem = Cafe | Mart;

type Props<T> = {
  items: T[];
  checkOperating: (item: T) => boolean;
  initialFavoriteNames: string[];
  favoriteStorageKey: string;
};

type ItemWithFlag<T> = T & {
  isOperating: boolean;
  favoriteRate: number;
};

const Grid = <T extends AvailableItem>(props: Props<T>) => {
  const windowWidth = Dimensions.get('window').width;
  const {items, checkOperating, initialFavoriteNames, favoriteStorageKey} =
    props;
  const syncFavoritesToStorage = (favorites: string[]) => {
    AsyncStorage.setItem(favoriteStorageKey, JSON.stringify(favorites));
  };

  const [focusedName, setFocusedItem] = useState<string | null>(null);
  const [favoriteNames, setFavoriteNames] =
    useState<string[]>(initialFavoriteNames);

  const sortedItems: ItemWithFlag<T>[] = chain(items)
    .map(item => {
      const isOperating = checkOperating(item);
      const favoriteRate =
        favoriteNames.findIndex(name => name === item.name) + 1;
      return {...item, isOperating, favoriteRate};
    })
    .sortBy(({isOperating, favoriteRate}) => {
      if (favoriteRate > 0) {
        return favoriteRate;
      } else if (isOperating) {
        return 100;
      } else {
        return 200;
      }
    })
    .value();

  const focusedItem =
    (focusedName !== null &&
      sortedItems.find(({name}) => name === focusedName)) ||
    null;

  function refineName(name: string): string {
    switch (name.trim()) {
      case 'Pascucci':
        return '파스쿠찌';
      case '투썸플레이스':
        return '투썸';
      case '카페이야기':
        return '카페 이야기';
      case '라운지스낵':
        return '라운지 스낵';
      case '수의대스낵':
        return '수의대 스낵';
      case '스누플렉스 (복합매장)':
        return '스누 플렉스';
      case '글로벌생활관 편의점':
        return '글로벌 생활관';
      default:
        return name;
    }
  }

  function refineTime(time: string): string {
    if (time.trim().includes('유인')) {
      return time.replace(' ', ' (') + ')';
    }
    return time;
  }
  return (
    <Box height="100%" bgColor={colors.white}>
      {sortedItems ? (
        <Box>
          <ScrollView bgColor={colors.white}>
            <VStack width="85%" marginTop={2.5} marginLeft="7.5%">
              {chain(sortedItems)
                .chunk(3)
                .map(itemsInARow =>
                  itemsInARow.length < 3
                    ? (itemsInARow.concat(
                        Array(3 - itemsInARow.length).fill(null),
                      ) as (ItemWithFlag<T> | null)[])
                    : itemsInARow,
                )
                .map(itemsInARow => {
                  return (
                    <Flex
                      key={itemsInARow[0]?.name}
                      height={windowWidth * 0.85 * 0.3}
                      marginBottom={windowWidth * 0.85 * 0.05}
                      flexDirection="row">
                      {itemsInARow.map((item, index) => {
                        if (!item) {
                          return (
                            <Box
                              key={'hi' + index}
                              width="30%"
                              height="100%"
                              marginRight="5%"
                              flex={1}
                            />
                          );
                        }
                        const {name, isOperating, favoriteRate} = item;

                        return (
                          <Button
                            key={name}
                            flext={1}
                            height="100%"
                            width="30%"
                            marginRight="5%"
                            padding={2}
                            onPress={() => setFocusedItem(item.name)}
                            variant={
                              favoriteRate > 0
                                ? isOperating
                                  ? 'favoriteOpenPlace'
                                  : 'favoriteClosedPlace'
                                : 'place'
                            }>
                            <Text
                              variant={
                                favoriteRate > 0
                                  ? 'favoritePlaceNameSmall'
                                  : isOperating
                                  ? 'normalOpenPlaceSmall'
                                  : 'normalClosedPlaceSmall'
                              }
                              textAlign="center">
                              {refineName(name)
                                .replace('편의점', '')
                                .trim()
                                .replace(' ', '\n')}
                            </Text>
                          </Button>
                        );
                      })}
                    </Flex>
                  );
                })
                .value()}
            </VStack>
          </ScrollView>
          {focusedItem ? (
            <Modal
              isOpen={focusedName !== null}
              onClose={() => setFocusedItem(null)}>
              <Modal.Content width="90%">
                <Modal.CloseButton />
                <Modal.Body>
                  <Box margin={6} marginBottom={1}>
                    <HStack left={-15} top={-15}>
                      <Text variant="modalTitle" marginBottom={1}>
                        {refineName(focusedItem.name)
                          .replace('편의점', '')
                          .trim()}
                      </Text>
                      <Button
                        bgColor="transparent"
                        left={-6}
                        top={-1}
                        onPress={() => {
                          setFavoriteNames(prev => {
                            if (prev.find(name => name === focusedItem.name)) {
                              const next = prev.filter(
                                name => name !== focusedItem.name,
                              );
                              syncFavoritesToStorage(next);
                              return next;
                            } else {
                              const next = prev.concat(focusedItem.name);
                              syncFavoritesToStorage(next);
                              return next;
                            }
                          });
                        }}>
                        {focusedItem.favoriteRate > 0 ? (
                          <FilledStar />
                        ) : (
                          <UnfilledStar />
                        )}
                      </Button>
                    </HStack>
                    <Text variant="modalSubInfo" left={-15} top={-20}>
                      {focusedItem.location}
                    </Text>
                  </Box>
                  <VStack>
                    <HStack width="100%">
                      <Text
                        width="40%"
                        variant="modalSubContent"
                        textAlign="center">
                        평일
                      </Text>
                      <Text
                        width="60%"
                        variant="modalSubContent"
                        textAlign="center">
                        {refineTime(focusedItem.weekday)}
                      </Text>
                    </HStack>
                    <Divider
                      my={2}
                      bg="black"
                      width="100%"
                      marginTop="14px"
                      marginBottom="14px"
                    />
                    <HStack width="100%">
                      <Text
                        width="40%"
                        variant="modalSubContent"
                        textAlign="center">
                        토요일
                      </Text>
                      <Text
                        width="60%"
                        variant="modalSubContent"
                        textAlign="center">
                        {refineTime(focusedItem.saturday)}
                      </Text>
                    </HStack>
                    <Divider
                      my={2}
                      bg="black"
                      width="100%"
                      marginTop="14px"
                      marginBottom="14px"
                    />
                    <HStack width="100%">
                      <Text
                        width="40%"
                        variant="modalSubContent"
                        textAlign="center">
                        휴일
                      </Text>
                      <Text
                        width="60%"
                        variant="modalSubContent"
                        textAlign="center"
                        marginBottom="20px">
                        {refineTime(focusedItem.holiday)}
                      </Text>
                    </HStack>
                  </VStack>
                </Modal.Body>
              </Modal.Content>
            </Modal>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
};

export default Grid;

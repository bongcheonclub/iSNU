import {chain, map} from 'lodash';
import {parse} from 'node-html-parser';
import {
  Box,
  Center,
  HStack,
  ScrollView,
  VStack,
  Modal,
  Flex,
  Divider,
  Row,
} from 'native-base';
import FilledStar from '../icons/filled-star.svg';
import UnfilledStar from '../icons/unfilled-star.svg';
import React, {useEffect, useState} from 'react';
import {colors} from '../ui/colors';
import {Shuttle} from '../screens/Shuttle';
import {ItemClick} from 'native-base/lib/typescript/components/composites/Typeahead/useTypeahead/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LOCAL_STORAGE} from '../helpers/localStorage';
import Button from './WrappedButton';
import Text from './Text';

type AvailableItem = Shuttle;

type Props<T extends AvailableItem> = {
  itemType: string;
  items: T[];
  checkOperating: (item: T) => {
    isOperating: boolean;
    operating: T['operatings'][number] | null;
  };
  initialFavoriteNames: string[];
  favoriteStorageKey: keyof LOCAL_STORAGE;
};

type ItemWithFlag<T> = T & {
  isOperating: boolean;
  interval: string | null;
  favoriteRate: number;
};

const List = <T extends AvailableItem>(props: Props<T>) => {
  const {
    items,
    checkOperating,
    initialFavoriteNames,
    favoriteStorageKey,
    itemType,
  } = props;
  const syncFavoritesToStorage = (favorites: string[]) => {
    AsyncStorage.setItem(favoriteStorageKey, JSON.stringify(favorites));
  };
  const [focusedName, setFocusedItem] = useState<string | null>(null);
  const [favoriteNames, setFavoriteNames] =
    useState<string[]>(initialFavoriteNames);

  const sortedItems: ItemWithFlag<T>[] = chain(items)
    .map(item => {
      const {isOperating, operating} = checkOperating(item);
      const favoriteRate =
        favoriteNames.findIndex(name => name === item.name) + 1;
      return {
        ...item,
        isOperating,
        favoriteRate,
        interval: operating?.interval ?? null,
      };
    })
    .sortBy(({isOperating, favoriteRate}) => {
      if (favoriteRate > 0 && isOperating) {
        return favoriteRate;
      } else if (favoriteRate > 0) {
        return 100 + favoriteRate;
      } else if (isOperating) {
        return 200;
      } else {
        return 300;
      }
    })
    .value();

  const focusedItem =
    (focusedName !== null &&
      sortedItems.find(({name}) => name === focusedName)) ||
    null;

  return (
    <Box height="100%" bgColor={colors.white}>
      {sortedItems ? (
        <Box>
          <ScrollView bgColor={colors.white}>
            <VStack width="85%" marginLeft="7.5%">
              {chain(sortedItems)
                .map(item => {
                  const {name, isOperating, favoriteRate, interval} = item;
                  return (
                    <Center key={item.name} marginY={2.5}>
                      <Button
                        label={`${itemType}-click-button`}
                        tags={{itemType, name, isOperating, favoriteRate}}
                        key={name}
                        width="100%"
                        height="72px"
                        paddingLeft="15px"
                        variant={
                          favoriteRate
                            ? isOperating
                              ? 'favoriteOpenPlace'
                              : 'favoriteClosedPlace'
                            : 'place'
                        }
                        onPress={() => setFocusedItem(item.name)}>
                        <Center flexDirection="row">
                          <Row height="100%" width="100%" alignItems="center">
                            <Text
                              width="64%"
                              variant={
                                favoriteRate > 0
                                  ? 'favoritePlaceNameBig'
                                  : isOperating
                                  ? 'normalOpenPlaceBig'
                                  : 'normalClosedPlaceBig'
                              }>
                              {name}
                            </Text>
                            <Text
                              textAlign="center"
                              width="36%"
                              variant="favoritePlaceTime">
                              {interval ? `배차간격: ${interval}` : '미운행중'}
                            </Text>
                          </Row>
                        </Center>
                      </Button>
                    </Center>
                  );
                })
                .value()}
            </VStack>
          </ScrollView>
          {focusedItem ? (
            <Modal
              isOpen={focusedName !== null}
              onClose={() => setFocusedItem(null)}>
              <Modal.Content
                paddingTop="8px"
                px="12px"
                paddingBottom="12px"
                width="90%">
                <Modal.CloseButton />
                <Box margin={6} marginBottom={1}>
                  <HStack left={-15} top={-15}>
                    <Text variant="modalTitle" marginBottom={1}>
                      {focusedItem.name}
                    </Text>
                    <Button
                      label={`${itemType}-toggle-favorite`}
                      tags={{
                        itemType,
                        name: focusedItem.name,
                        isOperating: focusedItem.isOperating,
                        favoriteRate: focusedItem.favoriteRate,
                      }}
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
                    평일만 운행
                  </Text>
                </Box>
                <VStack px="12px">
                  <HStack width="100%">
                    <Text
                      width="40%"
                      variant="modalSubInfo"
                      textAlign="center"
                    />
                    <Text width="30%" variant="modalSubInfo" textAlign="center">
                      배차간격
                    </Text>
                    <Text width="30%" variant="modalSubInfo" textAlign="center">
                      대수
                    </Text>
                  </HStack>
                  {focusedItem.operatings.map(item => (
                    <Box key={item.time}>
                      <Divider my={2} bg="black" width="100%" marginY="14px" />
                      <HStack key={item.time} width="100%">
                        <Text
                          width="40%"
                          variant="modalSubContent"
                          textAlign="center">
                          {item.time}
                        </Text>
                        <Text
                          width="30%"
                          variant="modalSubContent"
                          textAlign="center">
                          {item.interval}
                        </Text>
                        <Text
                          width="30%"
                          variant="modalSubContent"
                          textAlign="center">
                          {item.numbers}
                        </Text>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
                <Text marginBottom="2px" />
              </Modal.Content>
            </Modal>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
};

export default List;

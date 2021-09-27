import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import axios from 'axios';
import {chain, map} from 'lodash';
import {parse} from 'node-html-parser';
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
  Row,
} from 'native-base';
import FilledStar from '../icons/filled-star.svg';
import UnfilledStar from '../icons/unfilled-star.svg';
import React, {useEffect, useState} from 'react';
import {colors} from '../ui/colors';
import {Shuttle} from '../screens/Shuttle';
import {ItemClick} from 'native-base/lib/typescript/components/composites/Typeahead/useTypeahead/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AvailableItem = Shuttle;

type Props<T extends AvailableItem> = {
  items: T[];
  checkOperating: (item: T) => {
    isOperating: boolean;
    operating: T['operatings'][number] | null;
  };
  initialFavoriteNames: string[];
  favoriteStorageKey: string;
};

type ItemWithFlag<T> = T & {
  isOperating: boolean;
  interval: string | null;
  favorateRate: number;
};

const List = <T extends AvailableItem>(props: Props<T>) => {
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
      const {isOperating, operating} = checkOperating(item);
      const favorateRate =
        favoriteNames.findIndex(name => name === item.name) + 1;
      return {
        ...item,
        isOperating,
        favorateRate,
        interval: operating?.interval ?? null,
      };
    })
    .sortBy(({isOperating, favorateRate}) => {
      if (favorateRate > 0) {
        return favorateRate;
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

  return (
    <Box>
      {sortedItems ? (
        <Box>
          <ScrollView bgColor={colors.white}>
            <VStack paddingX={7}>
              {chain(sortedItems)
                .map(item => {
                  const {name, isOperating, favorateRate, interval} = item;
                  return (
                    <Box
                      key={name}
                      marginY={2}
                      borderRadius={8}
                      flex={1}
                      height="72px"
                      padding={0}
                      borderColor={
                        favorateRate > 0 ? undefined : colors.grey[200]
                      }
                      borderWidth={1}
                      bgColor={
                        favorateRate > 0 ? colors.bage[100] : colors.grey[100]
                      }>
                      <Button
                        height="100%"
                        width="100%"
                        bgColor="transparent"
                        onPress={() => setFocusedItem(item.name)}>
                        <Center flexDirection="row">
                          <Row height="100%" width="100%">
                            <Text
                              flex={1}
                              color={
                                favorateRate > 0
                                  ? colors.bage[200]
                                  : colors.grey[400]
                              }>
                              {name}
                            </Text>
                            <Text
                              flex={1}
                              color={
                                favorateRate > 0
                                  ? colors.bage[200]
                                  : colors.grey[400]
                              }>
                              {interval ? `배차간격: ${interval}` : '미운행중'}
                            </Text>
                          </Row>
                        </Center>
                      </Button>
                      <Box
                        position="absolute"
                        top={2}
                        right={2}
                        borderRadius={4}
                        bgColor={isOperating ? colors.green : colors.red}
                        width={2}
                        height={2}
                      />
                    </Box>
                  );
                })
                .value()}
            </VStack>
          </ScrollView>
          {focusedItem ? (
            <Modal
              isOpen={focusedName !== null}
              onClose={() => setFocusedItem(null)}>
              <Modal.Content>
                <Modal.Header>
                  <Flex flexDirection="row">
                    <Text color={colors.blue}>{focusedItem.name}</Text>
                    <Button
                      bgColor="transparent"
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
                      {focusedItem.favorateRate > 0 ? (
                        <FilledStar />
                      ) : (
                        <UnfilledStar />
                      )}
                    </Button>
                  </Flex>
                  <Text color={colors.grey[300]}>평일만 운행</Text>
                </Modal.Header>
                <Modal.CloseButton />
                <Modal.Body>
                  <Flex flexDirection="row">
                    <Center flex={1} />
                    <Center flex={1}>배차간격</Center>
                    <Center flex={1}>대수</Center>
                  </Flex>
                  {focusedItem.operatings.map(item => (
                    <Box key={item.time}>
                      <Divider bgColor={colors.black} width="100%" />
                      <Flex flexDirection="row">
                        <Center flex={1}>{item.time}</Center>
                        <Center flex={1}>{item.interval}</Center>
                        <Center flex={1}>{item.numbers}</Center>
                      </Flex>
                    </Box>
                  ))}
                </Modal.Body>
              </Modal.Content>
            </Modal>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
};

export default List;

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
} from 'native-base';
import FilledStar from '../icons/filled-star.svg';
import UnfilledStar from '../icons/unfilled-star.svg';
import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {compareAsc, getDay, parse as parseTime} from 'date-fns';
import {compareDesc} from 'date-fns/esm';
import {colors} from '../ui/colors';
import {Cafe} from '../screens/Cafe';
import {Mart} from '../screens/Mart';

type AvailableItem = Cafe | Mart;

type Props<T> = {
  items: T[];
  checkOperating: (item: T) => boolean;
  initialFavoriteNames: string[];
};

type ItemWithFlag<T> = T & {
  isOperating: boolean;
  favorateRate: number;
};

const Grid = <T extends AvailableItem>(props: Props<T>) => {
  const {items, checkOperating, initialFavoriteNames} = props;
  const [focusedName, setFocusedItem] = useState<string | null>(null);
  const [favoriteNames, setFavoriteNames] = useState<string[]>([]);

  const sortedItems: ItemWithFlag<T>[] = chain(items)
    .map(item => {
      const isOperating = checkOperating(item);
      const favorateRate =
        favoriteNames.findIndex(name => name === item.name) + 1;
      return {...item, isOperating, favorateRate};
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
    <Box height="100%" bgColor={colors.white}>
      {sortedItems ? (
        <Box>
          <ScrollView bgColor={colors.white}>
            <VStack padding={8}>
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
                      height={90}
                      marginY={2}
                      flexDirection="row">
                      {itemsInARow.map((item, index) => {
                        if (!item) {
                          return (
                            <Box
                              key={'hi' + index}
                              marginX={2}
                              flex={1}
                              height="100%"
                            />
                          );
                        }
                        const {name, isOperating, favorateRate} = item;

                        return (
                          <Box
                            key={name}
                            marginX={2}
                            borderRadius={8}
                            flex={1}
                            height="100%"
                            padding={0}
                            borderColor={
                              favorateRate > 0 ? undefined : colors.grey[200]
                            }
                            borderWidth={1}
                            bgColor={
                              favorateRate > 0
                                ? colors.bage[100]
                                : colors.grey[100]
                            }>
                            <Button
                              height="100%"
                              width="100%"
                              bgColor="transparent"
                              onPress={() => setFocusedItem(item.name)}>
                              <Text
                                color={
                                  favorateRate > 0
                                    ? colors.bage[200]
                                    : colors.grey[400]
                                }>
                                {name}
                              </Text>
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
              <Modal.Content>
                <Modal.Header>
                  <Flex flexDirection="row">
                    <Text color={colors.blue}>{focusedItem.name}</Text>
                    <Button
                      bgColor="transparent"
                      onPress={() => {
                        setFavoriteNames(prev => {
                          if (prev.find(name => name === focusedItem.name)) {
                            return prev.filter(
                              name => name !== focusedItem.name,
                            );
                          } else {
                            return prev.concat(focusedItem.name);
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
                  <Text color={colors.grey[300]}>{focusedItem.location}</Text>
                </Modal.Header>
                <Modal.CloseButton />
                <Modal.Body>
                  <Flex flexDirection="row">
                    <Center flex={1}>평일</Center>
                    <Center flex={1}>{focusedItem.weekday}</Center>
                  </Flex>
                  <Divider bgColor={colors.black} width="100%" />
                  <Flex flexDirection="row">
                    <Center flex={1}>토요일</Center>
                    <Center flex={1}>{focusedItem.saturday}</Center>
                  </Flex>
                  <Divider bgColor={colors.black} width="100%" />
                  <Flex flexDirection="row">
                    <Center flex={1}>휴일</Center>
                    <Center flex={1}>{focusedItem.holiday}</Center>
                  </Flex>
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

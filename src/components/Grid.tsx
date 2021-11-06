import {chain} from 'lodash';
import {Dimensions} from 'react-native';
import {Box, HStack, ScrollView, VStack, Modal, Divider} from 'native-base';
import FilledStarIcon from '../icons/filled-star.svg';
import UnfilledStarIcon from '../icons/unfilled-star.svg';
import React, {useCallback, useMemo, useState} from 'react';
import {colors} from '../ui/colors';
import {CafeData} from '../screens/Cafe';
import {MartData} from '../screens/Mart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LocalStorage} from '../helpers/localStorage';
import Button from './WrappedButton';
import Text from './Text';

type AvailableItem = CafeData | MartData;

type Props<T> = {
  itemType: string;
  items: T[];
  checkOperating: (item: T) => boolean;
  initialFavoriteNames: string[];
  favoriteStorageKey: keyof LocalStorage;
};

type ItemWithFlag<T> = T & {
  isOperating: boolean;
  favoriteRate: number;
};

const FocusedModal = <T extends AvailableItem>({
  item,
  onClose,
  itemType,
  toggleFavorite,
}: {
  item: ItemWithFlag<T>;
  onClose: () => void;
  itemType: string;
  toggleFavorite: (itemName: string) => void;
}) => {
  const tags = useMemo(
    () => ({
      itemType,
      name: item.name,
      isOperating: item.isOperating,
      favoriteRate: item.favoriteRate,
    }),
    [item.favoriteRate, item.isOperating, item.name, itemType],
  );

  const handlePressStar = useCallback(() => {
    toggleFavorite(item.name);
  }, [item.name, toggleFavorite]);
  return (
    <Modal isOpen onClose={onClose}>
      <Modal.Content
        paddingTop="8px"
        px="12px"
        paddingBottom="12px"
        width="90%">
        <Modal.CloseButton />
        <Box margin={6} marginBottom={1}>
          <HStack left={-15} top={-15}>
            <Text variant="modalTitle" marginBottom={1}>
              {item.name}
            </Text>
            <Button
              label={`${itemType}-toggle-favorite`}
              tags={tags}
              bgColor="transparent"
              left={-6}
              top={-1}
              onPress={handlePressStar}>
              {item.favoriteRate > 0 ? (
                <FilledStarIcon />
              ) : (
                <UnfilledStarIcon />
              )}
            </Button>
          </HStack>
          <Text variant="modalSubInfo" left={-15} top={-20}>
            {item.location}
          </Text>
        </Box>
        <VStack px="12px">
          <HStack width="100%">
            <Text width="35%" variant="modalSubContent" textAlign="center">
              평일
            </Text>
            <Text width="65%" variant="modalSubContent" textAlign="center">
              {item.weekday}
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
            <Text width="35%" variant="modalSubContent" textAlign="center">
              토요일
            </Text>
            <Text width="65%" variant="modalSubContent" textAlign="center">
              {item.saturday}
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
            <Text width="35%" variant="modalSubContent" textAlign="center">
              휴일
            </Text>
            <Text
              width="65%"
              variant="modalSubContent"
              textAlign="center"
              marginBottom="20px">
              {item.holiday}
            </Text>
          </HStack>
        </VStack>
      </Modal.Content>
    </Modal>
  );
};

const Grid = <T extends AvailableItem>(props: Props<T>) => {
  const windowWidth = Dimensions.get('window').width;
  const {
    items,
    checkOperating,
    initialFavoriteNames,
    favoriteStorageKey,
    itemType,
  } = props;
  const [focusedName, setFocusedItem] = useState<string | null>(null);
  const [favoriteNames, setFavoriteNames] =
    useState<string[]>(initialFavoriteNames);

  const toggleFavorite = useCallback(
    (itemName: string) => {
      const syncFavoritesToStorage = (favorites: string[]) => {
        AsyncStorage.setItem(favoriteStorageKey, JSON.stringify(favorites));
      };
      setFavoriteNames(prev => {
        if (prev.find(name => name === itemName)) {
          const next = prev.filter(name => name !== itemName);
          syncFavoritesToStorage(next);
          return next;
        } else {
          const next = prev.concat(itemName);
          syncFavoritesToStorage(next);
          return next;
        }
      });
    },
    [favoriteStorageKey],
  );

  const sortedItems: ItemWithFlag<T>[] = useMemo(
    () =>
      chain(items)
        .map(item => {
          const isOperating = checkOperating(item);
          const favoriteRate =
            favoriteNames.findIndex(name => name === item.name) + 1;
          return {...item, isOperating, favoriteRate};
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
        .value(),
    [checkOperating, favoriteNames, items],
  );

  const handleCloseFocusedModal = useCallback(() => setFocusedItem(null), []);

  const ItemButton = ({item}: {item: ItemWithFlag<T>}) => {
    const {name, isOperating, favoriteRate} = item;
    const tags = useMemo(
      () => ({
        itemType,
        name,
        isOperating,
        favoriteRate,
      }),
      [favoriteRate, isOperating, name],
    );
    const onPress = useCallback(() => {
      setFocusedItem(item.name);
    }, [item.name]);
    return (
      <Button
        label={`${itemType}-click-button`}
        tags={tags}
        height="100%"
        width="30%"
        padding={2}
        onPress={onPress}
        variant={favoriteRate > 0 ? 'favoritePlace' : 'normalPlace'}>
        <Text
          variant={
            favoriteRate > 0
              ? isOperating
                ? 'favoriteOpenPlaceNameSmall'
                : 'favoriteClosedPlaceNameSmall'
              : isOperating
              ? 'normalOpenPlaceSmall'
              : 'normalClosedPlaceSmall'
          }
          textAlign="center">
          {name.replace(' ', '\n')}
        </Text>
      </Button>
    );
  };

  const focusedItem = useMemo(
    () =>
      (focusedName !== null &&
        sortedItems.find(({name}) => name === focusedName)) ||
      null,
    [focusedName, sortedItems],
  );

  return (
    <Box height="100%" bgColor={colors.white}>
      {sortedItems ? (
        <Box>
          <ScrollView bgColor={colors.white}>
            <VStack width="85%" marginTop="15px" marginLeft="7.5%">
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
                    <HStack
                      key={itemsInARow[0]?.name}
                      height={windowWidth * 0.85 * 0.3}
                      width="100%"
                      marginBottom={windowWidth * 0.85 * 0.05}
                      justifyContent="space-between">
                      {itemsInARow.map((item, index) => {
                        if (!item) {
                          return (
                            <Box key={'hi' + index} width="30%" height="100%" />
                          );
                        }

                        return <ItemButton key={item.name} item={item} />;
                      })}
                    </HStack>
                  );
                })
                .value()}
            </VStack>
          </ScrollView>
          {focusedItem && (
            <FocusedModal
              item={focusedItem}
              itemType={itemType}
              onClose={handleCloseFocusedModal}
              toggleFavorite={toggleFavorite}
            />
          )}
        </Box>
      ) : null}
    </Box>
  );
};

export default Grid;

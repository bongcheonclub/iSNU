import {chain} from 'lodash';
import {
  Box,
  Center,
  HStack,
  ScrollView,
  VStack,
  Modal,
  Divider,
  Row,
} from 'native-base';
import React, {useCallback, useMemo, useState} from 'react';
import FilledStarIcon from '../icons/filled-star.svg';
import UnfilledStarIcon from '../icons/unfilled-star.svg';
import {colors} from '../ui/colors';
import {ShuttleType} from '../screens/Shuttle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LocalStorage} from '../helpers/localStorage';
import Button from './WrappedButton';
import Text from './Text';

type AvailableItem = ShuttleType;

type Props<T extends AvailableItem> = {
  itemType: string;
  items: T[];
  checkOperating: (item: T) => {
    isOperating: boolean;
    operating: T['operatings'][number] | null;
  };
  initialFavoriteNames: string[];
  favoriteStorageKey: keyof LocalStorage;
};

type ItemWithFlag<T> = T & {
  isOperating: boolean;
  interval: string | null;
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
  const handlePressStar = useCallback(() => {
    toggleFavorite(item.name);
  }, [item.name, toggleFavorite]);
  const TagsOfFocusedItem = useMemo(() => {
    if (!item) {
      return {};
    }
    return {
      itemType,
      name: item.name,
      isOperating: item.isOperating,
      favoriteRate: item.favoriteRate,
    };
  }, [item, itemType]);
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
              tags={TagsOfFocusedItem}
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
            평일만 운행
          </Text>
        </Box>
        <VStack px="12px">
          <HStack width="100%">
            <Text width="40%" variant="modalSubInfo" textAlign="center" />
            <Text width="30%" variant="modalSubInfo" textAlign="center">
              배차간격
            </Text>
            <Text width="30%" variant="modalSubInfo" textAlign="center">
              대수
            </Text>
          </HStack>
          {item.operatings.map(operating => (
            <Box key={operating.time}>
              <Divider my={2} bg="black" width="100%" marginY="14px" />
              <HStack key={operating.time} width="100%">
                <Text width="40%" variant="modalSubContent" textAlign="center">
                  {operating.time}
                </Text>
                <Text width="30%" variant="modalSubContent" textAlign="center">
                  {operating.interval}
                </Text>
                <Text width="30%" variant="modalSubContent" textAlign="center">
                  {operating.numbers}
                </Text>
              </HStack>
            </Box>
          ))}
        </VStack>
        <Text marginBottom="2px" />
      </Modal.Content>
    </Modal>
  );
};

const List = <T extends AvailableItem>(props: Props<T>) => {
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

  const sortedItems: ItemWithFlag<T>[] = useMemo(
    () =>
      chain(items)
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
        .value(),

    [checkOperating, favoriteNames, items],
  );

  const focusedItem = useMemo(
    () =>
      (focusedName !== null &&
        sortedItems.find(({name}) => name === focusedName)) ||
      null,
    [focusedName, sortedItems],
  );

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

  const handleCloseFocusedModal = useCallback(() => setFocusedItem(null), []);

  const ItemButton = ({item}: {item: ItemWithFlag<T>}) => {
    const {name, isOperating, favoriteRate, interval} = item;
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
      <Center marginY={2.5}>
        <Button
          label={`${itemType}-click-button`}
          tags={tags}
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
          onPress={onPress}>
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
              <Text textAlign="center" width="36%" variant="favoritePlaceTime">
                {interval ? `배차간격: ${interval}` : '미운행중'}
              </Text>
            </Row>
          </Center>
        </Button>
      </Center>
    );
  };

  return (
    <Box height="100%" bgColor={colors.white}>
      {sortedItems ? (
        <Box>
          <ScrollView bgColor={colors.white}>
            <VStack width="85%" marginLeft="7.5%">
              {chain(sortedItems)
                .map(item => {
                  return <ItemButton key={item.name} item={item} />;
                })
                .value()}
            </VStack>
          </ScrollView>
          {focusedItem && (
            <FocusedModal
              itemType={itemType}
              item={focusedItem}
              onClose={handleCloseFocusedModal}
              toggleFavorite={toggleFavorite}
            />
          )}
        </Box>
      ) : null}
    </Box>
  );
};

export default List;

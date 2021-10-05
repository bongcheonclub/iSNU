import More from './icons/more.svg';
import Outlink from './icons/outlink.svg';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import getPublicIp from 'react-native-public-ip';
import {
  Box,
  Button,
  Center,
  Flex,
  Input,
  Modal,
  NativeBaseProvider,
  Pressable,
  Text,
  TextArea,
} from 'native-base';
import React, {useCallback, useEffect, useState} from 'react';
import Cafe from './screens/Cafe';
import type {Cafe as CafeType} from './screens/Cafe';
import type {Mart as MartType} from './screens/Mart';
import Etcs from './screens/Etcs';
import Mart from './screens/Mart';
import Meal from './screens/Meal';
import Shuttle from './screens/Shuttle';
import CafeIcon from './icons/cafe.svg';
import EtcsIcon from './icons/etcs.svg';
import MartIcon from './icons/mart.svg';
import MealIcon from './icons/meal.svg';
import ShuttleIcon from './icons/shuttle.svg';
import {colors} from './ui/colors';
import SplashScreen from 'react-native-splash-screen';
import {theme} from './ui/theme';
import {initializeData} from './InitializeData';
import {NativeSyntheticEvent, TextInputChangeEventData} from 'react-native';
import {slack} from './helpers/axios';
import {MealData} from './InitializeData/ProcessMealData';
import {Awaited} from './helpers/type';

const Tab = createBottomTabNavigator();

export default function App() {
  const [data, setData] = useState<Awaited<
    ReturnType<typeof initializeData>
  > | null>(null);

  const [selectedMoreTap, setSelectedMoreTap] = useState<
    'tip' | 'suggest' | 'main' | null
  >(null);
  const [tipInput, setTipInput] = useState<string>('');
  const [suggestInput, setSuggestInput] = useState<string>('');

  const handleBack = useCallback(() => {
    setSelectedMoreTap('main');
  }, []);

  const handleTipInput = useCallback((text: string) => {
    setTipInput(text);
  }, []);

  const handleSuggestInput = useCallback((text: string) => {
    setSuggestInput(text);
  }, []);

  const handleSubmitTip = useCallback(async () => {
    setSelectedMoreTap(null);
    setTipInput('');
    try {
      const ip = await getPublicIp();

      const textLines = [`ip: ${ip}`, `내용: ${tipInput}`];

      await slack.post('', {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '잘못된 정보 제보',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: textLines.join('\n'),
            },
          },
        ],
      });
    } catch (e) {
      console.error(e);
    }
  }, [tipInput]);

  const handleSubmitSuggest = useCallback(async () => {
    setSelectedMoreTap(null);
    setSuggestInput('');
    try {
      const ip = await getPublicIp();

      const textLines = [`ip: ${ip}`, `내용: ${suggestInput}`];

      await slack.post('', {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '기능 추가 건의',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: textLines.join('\n'),
            },
          },
        ],
      });
    } catch (e) {
      console.error(e);
    }
  }, [suggestInput]);

  useEffect(() => {
    initializeData().then(initializedData => {
      setData(initializedData);
      SplashScreen.hide();
    });
  }, []);
  return (
    <NativeBaseProvider theme={theme}>
      {data ? (
        <NavigationContainer>
          <Tab.Navigator
            initialRouteName={'Mart'}
            screenOptions={{
              headerStatusBarHeight: 100,
              headerTitleStyle: {
                color: colors.blue,
                fontSize: 40,
                marginLeft: 12,
                top: '0%',
                height: '150%',
              },
              headerTitleAlign: 'left',
              headerStyle: {borderBottomWidth: 0, height: 140},
              headerTitleContainerStyle: {paddingBottom: 10},
              headerRight: () => (
                <Button
                  marginBottom="14px"
                  marginRight="3"
                  onPress={() => setSelectedMoreTap('main')}
                  backgroundColor="transparent">
                  <More />
                </Button>
              ),
            }}>
            <Tab.Screen
              name="식당"
              options={{
                tabBarIcon: () => <MealIcon />,
              }}>
              {props => <Meal {...props} mealData={data.mealData} />}
            </Tab.Screen>

            <Tab.Screen
              name="카페"
              options={{
                tabBarIcon: () => <CafeIcon />,
              }}>
              {props => (
                <Cafe
                  {...props}
                  cafes={data.cafeData}
                  initialFavoriteNames={data.favoriteCafes}
                />
              )}
            </Tab.Screen>
            <Tab.Screen
              name="편의점"
              options={{
                tabBarIcon: () => <MartIcon />,
              }}>
              {props => (
                <Mart
                  {...props}
                  marts={data.martData}
                  initialFavoriteNames={data.favoriteMarts}
                />
              )}
            </Tab.Screen>
            <Tab.Screen
              name="셔틀"
              options={{
                tabBarIcon: () => <ShuttleIcon />,
              }}>
              {props => (
                <Shuttle
                  {...props}
                  initialFavoriteNames={data.favoriteShuttles}
                />
              )}
            </Tab.Screen>
            <Tab.Screen
              name="기타"
              component={Etcs}
              options={{
                tabBarIcon: () => <EtcsIcon />,
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      ) : null}
      <Modal
        isOpen={!!selectedMoreTap}
        onClose={() => setSelectedMoreTap(null)}>
        <Modal.Content>
          {selectedMoreTap === 'main' && (
            <Modal.Body width="100%" paddingTop="32px" paddingRight="32px">
              <Modal.CloseButton />
              <Pressable onPress={() => setSelectedMoreTap('tip')}>
                <Center flexDirection="row">
                  <Text
                    marginLeft="auto"
                    marginRight="5px"
                    color="blue"
                    fontSize="25px"
                    fontWeight="extrabold">
                    잘못된 정보 제보하기
                  </Text>
                  <Outlink />
                </Center>
              </Pressable>
              <Pressable onPress={() => setSelectedMoreTap('suggest')}>
                <Center flexDirection="row">
                  <Text
                    marginLeft="auto"
                    marginRight="5px"
                    color="blue"
                    fontSize="25px"
                    fontWeight="extrabold">
                    기능 추가 건의하기
                  </Text>
                  <Outlink />
                </Center>
              </Pressable>
              <Pressable>
                <Center flexDirection="row">
                  <Text
                    marginLeft="auto"
                    marginRight="5px"
                    color="blue"
                    fontSize="25px"
                    fontWeight="extrabold">
                    개발자들 보러 가기
                  </Text>
                  <Outlink />
                </Center>
              </Pressable>
            </Modal.Body>
          )}
          {selectedMoreTap === 'tip' && (
            <Box>
              <Modal.Header display="flex" flexDir="row">
                <Pressable onPress={handleBack} marginRight={2}>
                  <Outlink />
                </Pressable>
                <Text>잘못된 정보 제보하기</Text>
                <Modal.CloseButton />
              </Modal.Header>
              <Modal.Body>
                <TextArea
                  height="200"
                  value={tipInput}
                  onChangeText={handleTipInput}
                  placeholder="내용 입력하기"
                />
              </Modal.Body>
              <Modal.Footer>
                <Button onPress={handleSubmitTip}>
                  <Text>제출하기</Text>
                </Button>
              </Modal.Footer>
            </Box>
          )}
          {selectedMoreTap === 'suggest' && (
            <Box>
              <Modal.Header display="flex" flexDir="row">
                <Pressable onPress={handleBack} marginRight={2}>
                  <Outlink />
                </Pressable>
                <Text>기능 추가 건의하기</Text>
                <Modal.CloseButton />
              </Modal.Header>
              <Modal.Body>
                <TextArea
                  height="200"
                  value={suggestInput}
                  onChangeText={handleSuggestInput}
                  placeholder="내용 입력하기"
                />
              </Modal.Body>
              <Modal.Footer>
                <Button onPress={handleSubmitSuggest}>
                  <Text>제출하기</Text>
                </Button>
              </Modal.Footer>
            </Box>
          )}
        </Modal.Content>
      </Modal>
    </NativeBaseProvider>
  );
}

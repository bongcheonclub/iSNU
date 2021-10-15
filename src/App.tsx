import {NavigationContainer} from '@react-navigation/native';
import {
  Box,
  Flex,
  NativeBaseProvider,
  HStack,
  StatusBar,
  Alert,
  VStack,
  IconButton,
  CloseIcon,
} from 'native-base';
import React, {useCallback, useEffect, useState} from 'react';
import {SafeAreaView, Dimensions, Platform} from 'react-native';
import Cafe from './screens/Cafe';
import type {Cafe as CafeType} from './screens/Cafe';
import type {Mart as MartType} from './screens/Mart';
import Etcs from './screens/Etcs';
import Mart from './screens/Mart';
import Meal from './screens/Meal';
import Shuttle from './screens/Shuttle';
import CafeIcon from './icons/cafe.svg';
import EtcsIcon from './icons/etc.svg';
import MartIcon from './icons/mart.svg';
import MealIcon from './icons/meal.svg';
import ShuttleIcon from './icons/shuttle.svg';
import {colors} from './ui/colors';
import SplashScreen from 'react-native-splash-screen';
import {theme} from './ui/theme';
import {initializeData} from './InitializeData';
import {Awaited} from './helpers/type';
import MoreModal from './components/MoreModal';
import Text from './components/Text';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

export default function App() {
  const windowHeight = Dimensions.get('window').height;
  const windowWidth = Dimensions.get('window').width;
  const [data, setData] = useState<Awaited<
    ReturnType<typeof initializeData>
  > | null>(null);

  useEffect(() => {
    initializeData().then(initializedData => {
      setData(initializedData);
      SplashScreen.hide();
    });
  }, []);
  return (
    <NativeBaseProvider theme={theme}>
      <Box width="100%" height="100%" safeArea backgroundColor="white">
        <StatusBar barStyle="dark-content" />

        {data ? (
          <>
            <NavigationContainer>
              <Tab.Navigator
                initialRouteName={'식당'}
                screenOptions={({route}) => ({
                  headerShown: false,
                  tabBarActiveTintColor: '#0085FF',
                  tabBarInactiveTintColor: '#636363',
                  tabBarStyle: {
                    paddingTop: Platform.OS === 'android' ? 16 : 2,
                    paddingBottom: 0,
                    height: 52,
                    borderTopColor: '#DCDCDC',
                    borderTopWidth: 1,
                    borderBottomColor: '#DCDCDC',
                    borderBottomWidth: Platform.OS === 'android' ? 1 : 0,
                  },
                  tabBarLabelStyle: {
                    fontFamily: 'NotoSansKR-Medium',
                    top: Platform.OS === 'android' ? 4 : -3,
                    // paddingBottom: 5,
                  },
                  tabBarIconStyle: {
                    // height: 30
                    // width: 45,
                    // alignItems: 'center',
                  },
                  showIcon: true,
                })}>
                <Tab.Screen
                  name="식당"
                  options={{
                    tabBarIcon: () => <MealIcon width="24px" height="24px" />,
                  }}>
                  {props => (
                    <Flex height="100%">
                      <HStack
                        flexDir="row"
                        bg={theme.colors.white}
                        alignItems="flex-end"
                        justifyContent="space-between"
                        paddingTop="18px"
                        borderBottomWidth="1px"
                        borderColor={theme.colors.gray[300]}
                        paddingLeft={windowWidth * 0.075}>
                        <Text bottom="8px" variant="pageTitle">
                          식당
                        </Text>
                        <MoreModal />
                      </HStack>
                      <Box flex={1}>
                        <Meal {...props} mealData={data.mealData} />
                      </Box>
                    </Flex>
                  )}
                </Tab.Screen>

                <Tab.Screen
                  name="카페"
                  options={{
                    tabBarIcon: () => <CafeIcon width="24px" height="24px" />,
                  }}>
                  {props => (
                    <Flex height="100%">
                      <HStack
                        flexDir="row"
                        bg={theme.colors.white}
                        alignItems="flex-end"
                        justifyContent="space-between"
                        paddingTop="18px"
                        borderBottomWidth="1px"
                        borderColor={theme.colors.gray[300]}
                        paddingLeft={windowWidth * 0.075}>
                        <Text bottom="8px" variant="pageTitle">
                          카페
                        </Text>
                        <MoreModal />
                      </HStack>
                      <Box flex={1}>
                        <Cafe
                          {...props}
                          cafes={data.cafeData}
                          initialFavoriteNames={data.favoriteCafes}
                        />
                      </Box>
                    </Flex>
                  )}
                </Tab.Screen>
                <Tab.Screen
                  name="편의점"
                  options={{
                    tabBarIcon: () => <MartIcon width="24px" height="24px" />,
                  }}>
                  {props => (
                    <Flex height="100%">
                      <HStack
                        flexDir="row"
                        bg={theme.colors.white}
                        alignItems="flex-end"
                        justifyContent="space-between"
                        paddingTop="18px"
                        borderBottomWidth="1px"
                        borderColor={theme.colors.gray[300]}
                        paddingLeft={windowWidth * 0.075}>
                        <Text bottom="8px" variant="pageTitle">
                          편의점
                        </Text>
                        <MoreModal />
                      </HStack>
                      <Box flex={1}>
                        <Mart
                          {...props}
                          marts={data.martData}
                          initialFavoriteNames={data.favoriteMarts}
                        />
                      </Box>
                    </Flex>
                  )}
                </Tab.Screen>
                <Tab.Screen
                  name="셔틀"
                  options={{
                    tabBarIcon: () => (
                      <ShuttleIcon width="24px" height="24px" />
                    ),
                  }}>
                  {props => (
                    <Flex height="100%">
                      <HStack
                        flexDir="row"
                        bg={theme.colors.white}
                        alignItems="flex-end"
                        justifyContent="space-between"
                        paddingTop="18px"
                        borderBottomWidth="1px"
                        borderColor={theme.colors.gray[300]}
                        paddingLeft={windowWidth * 0.075}>
                        <Text bottom="8px" variant="pageTitle">
                          셔틀
                        </Text>
                        <MoreModal />
                      </HStack>
                      <Box flex={1}>
                        <Shuttle
                          {...props}
                          initialFavoriteNames={data.favoriteShuttles}
                        />
                      </Box>
                    </Flex>
                  )}
                </Tab.Screen>
                <Tab.Screen
                  name="기타"
                  options={{
                    tabBarIcon: () => <EtcsIcon width="35px" height="35px" />,
                  }}>
                  {props => (
                    <Flex height="100%">
                      <HStack
                        flexDir="row"
                        bg={theme.colors.white}
                        alignItems="flex-end"
                        justifyContent="space-between"
                        paddingTop="18px"
                        borderBottomWidth="1px"
                        borderColor={theme.colors.gray[300]}
                        paddingLeft={windowWidth * 0.075}>
                        <Text bottom="8px" variant="pageTitle">
                          기타
                        </Text>
                        <MoreModal />
                      </HStack>
                      <Box flex={1}>
                        <Etcs />
                      </Box>
                    </Flex>
                  )}
                </Tab.Screen>
              </Tab.Navigator>
            </NavigationContainer>
          </>
        ) : null}
        <FirstAlert />
      </Box>
    </NativeBaseProvider>
  );
}

const FirstAlert = () => {
  const [displayNotice, setDisplayNotice] = useState(false);
  useEffect(() => {
    (async () => {
      const alreadyViewNotice = await AsyncStorage.getItem('wasViewedNotice');
      if (alreadyViewNotice !== 'true') {
        setDisplayNotice(true);
      }
    })();
  }, []);

  return displayNotice ? (
    <Alert
      w="90%"
      status="info"
      colorScheme="info"
      marginX="5%"
      marginBottom={Platform.OS === 'android' ? '70px' : '100px'}
      bottom="0px"
      shadow={9}
      position="absolute">
      <VStack
        padding="2%"
        space={2}
        flexShrink={1}
        w="100%"
        alignItems="center"
        justifyContent="center">
        <HStack
          w="100%"
          flexShrink={1}
          space={2}
          alignItems="center"
          justifyContent="space-between">
          <Alert.Icon size="5" />
          <Text fontSize="md" fontWeight="medium" color="coolGray.800">
            코로나19 관련 운영시간 변동 안내
          </Text>
          <IconButton
            onPress={() => {
              setDisplayNotice(false);
              AsyncStorage.setItem('wasViewedNotice', 'true');
            }}
            variant="unstyled"
            icon={<CloseIcon size="3" color="coolGray.600" />}
          />
        </HStack>
        <Box w="100%">
          <Text color="coolGray.600" fontSize="16px" lineHeight="lg">
            {'\n'}모든 정보는 생활협동조합 홈페이지, 마이스누 포털 등을 바탕으로
            바탕으로 제공됩니다. {'\n\n'}다만 코로나19 상황에 따라 각 매장의
            실제 운영시간에 변동이 있을 수 있습니다.
            {'\n\n'}혹시 잘못된 정보를 확인하신 분들은 제보하기 기능을 통해
            제보해주시면 감사하겠습니다.{'\n\n'}저희도 앞으로 더 정확한 정보를
            제공하기 위하여 노력하겠습니다. 감사합니다.
          </Text>
        </Box>
      </VStack>
    </Alert>
  ) : null;
};

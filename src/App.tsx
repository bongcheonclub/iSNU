import {NavigationContainer} from '@react-navigation/native';
import {Box, Flex, NativeBaseProvider, HStack} from 'native-base';
import React, {useCallback, useEffect, useState} from 'react';
import {SafeAreaView, Dimensions} from 'react-native';
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
import MoreModal from './components/MoreModal';
import amplitude from './helpers/amplitude';

import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import Text from './components/Text';
import {gridAutoColumns} from 'styled-system';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createMaterialTopTabNavigator();

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
        {data ? (
          <>
            <NavigationContainer>
              <Tab.Navigator
                initialRouteName={'Mart'}
                tabBarPosition="bottom"
                screenOptions={({route}) => ({
                  tabBarStyle: {
                    height: 65,
                    borderTopColor: '#DCDCDC',
                    borderTopWidth: 1,
                  },
                  tabBarLabelStyle: {
                    fontFamily: 'Noto Sans KR',
                  },
                  tabBarIconStyle: {
                    alignItems: 'center',
                    top: -5,
                  },
                  tabBarItemStyle: {
                    top: 0,
                  },
                  tabBarIndicatorStyle: {
                    height: 0,
                  },
                })}>
                <Tab.Screen
                  name="식당"
                  options={{
                    tabBarIcon: () => <MealIcon width="30px" height="30px" />,
                  }}
                  listeners={{
                    tabPress: e => {
                      amplitude.logEvent('meal');
                    },
                  }}>
                  {props => (
                    <Flex height="100%">
                      <HStack
                        flexDir="row"
                        bg={theme.colors.white}
                        alignItems="flex-end"
                        justifyContent="space-between"
                        paddingTop="15px"
                        borderBottomWidth="1px"
                        borderColor={theme.colors.gray[300]}
                        paddingLeft={windowWidth * 0.075}>
                        <Text variant="pageTitle">식당</Text>
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
                    tabBarIcon: () => <CafeIcon width="30px" height="30px" />,
                  }}
                  listeners={{
                    tabPress: e => {
                      amplitude.logEvent('cafe');
                    },
                  }}>
                  {props => (
                    <Flex height="100%">
                      <HStack
                        flexDir="row"
                        bg={theme.colors.white}
                        alignItems="flex-end"
                        justifyContent="space-between"
                        paddingTop="15px"
                        borderBottomWidth="1px"
                        borderColor={theme.colors.gray[300]}
                        paddingLeft={windowWidth * 0.075}>
                        <Text variant="pageTitle">카페</Text>
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
                    tabBarIcon: () => <MartIcon width="25px" height="25px" />,
                  }}
                  listeners={{
                    tabPress: e => {
                      amplitude.logEvent('mart');
                    },
                  }}>
                  {props => (
                    <Flex height="100%">
                      <HStack
                        flexDir="row"
                        bg={theme.colors.white}
                        alignItems="flex-end"
                        justifyContent="space-between"
                        paddingTop="15px"
                        borderBottomWidth="1px"
                        borderColor={theme.colors.gray[300]}
                        paddingLeft={windowWidth * 0.075}>
                        <Text variant="pageTitle">편의점</Text>
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
                      <ShuttleIcon width="25px" height="25px" />
                    ),
                  }}
                  listeners={{
                    tabPress: e => {
                      amplitude.logEvent('shuttle');
                    },
                  }}>
                  {props => (
                    <Flex height="100%">
                      <HStack
                        flexDir="row"
                        bg={theme.colors.white}
                        alignItems="flex-end"
                        justifyContent="space-between"
                        paddingTop="15px"
                        borderBottomWidth="1px"
                        borderColor={theme.colors.gray[300]}
                        paddingLeft={windowWidth * 0.075}>
                        <Text variant="pageTitle">셔틀</Text>
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
                    tabBarIcon: () => <EtcsIcon width="30px" height="30px" />,
                  }}
                  listeners={{
                    tabPress: e => {
                      amplitude.logEvent('etcs');
                    },
                  }}>
                  {props => (
                    <Flex height="100%">
                      <HStack
                        flexDir="row"
                        bg={theme.colors.white}
                        alignItems="flex-end"
                        justifyContent="space-between"
                        paddingTop="15px"
                        borderBottomWidth="1px"
                        borderColor={theme.colors.gray[300]}
                        paddingLeft={windowWidth * 0.075}>
                        <Text variant="pageTitle">기타</Text>
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
      </Box>
    </NativeBaseProvider>
  );
}

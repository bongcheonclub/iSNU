import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {NativeBaseProvider} from 'native-base';
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
import MoreModal from './components/MoreModal';
import amplitude from './helpers/amplitude';

const Tab = createBottomTabNavigator();

export default function App() {
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
              headerRight: () => <MoreModal />,
            }}>
            <Tab.Screen
              name="식당"
              options={{
                tabBarIcon: () => <MealIcon />,
              }}
              listeners={{
                tabPress: e => {
                  amplitude.logEvent('meal');
                },
              }}>
              {props => <Meal {...props} mealData={data.mealData} />}
            </Tab.Screen>

            <Tab.Screen
              name="카페"
              options={{
                tabBarIcon: () => <CafeIcon />,
              }}
              listeners={{
                tabPress: e => {
                  amplitude.logEvent('cafe');
                },
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
              }}
              listeners={{
                tabPress: e => {
                  amplitude.logEvent('mart');
                },
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
              }}
              listeners={{
                tabPress: e => {
                  amplitude.logEvent('shuttle');
                },
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
              listeners={{
                tabPress: e => {
                  amplitude.logEvent('etcs');
                },
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      ) : null}
    </NativeBaseProvider>
  );
}

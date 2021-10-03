/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {NativeBaseProvider} from 'native-base';
import React, {useEffect, useState} from 'react';
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
import {initializeData} from './helpers/initializeData';

const Tab = createBottomTabNavigator();

export default function App() {
  const [data, setData] = useState<{
    marts: MartType[];
    cafes: CafeType[];
    initialFavoriteCafes: string[];
    initialFavoriteMarts: string[];
    initialFavoriteShuttles: string[];
  } | null>(null);
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
              headerTitleStyle: {color: colors.blue, fontSize: 40},
              headerTitleAlign: 'left',
              headerStyle: {borderBottomWidth: 0},
            }}>
            <Tab.Screen
              name="식당"
              component={Meal}
              options={{
                tabBarIcon: () => <MealIcon />,
              }}
            />
            <Tab.Screen
              name="카페"
              options={{
                tabBarIcon: () => <CafeIcon />,
              }}>
              {props => (
                <Cafe
                  {...props}
                  cafes={data.cafes}
                  initialFavoriteNames={data.initialFavoriteCafes}
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
                  marts={data.marts}
                  initialFavoriteNames={data.initialFavoriteMarts}
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
                  initialFavoriteNames={data.initialFavoriteShuttles}
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
    </NativeBaseProvider>
  );
}

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
import React from 'react';
import {StyleSheet} from 'react-native';
import Cafe from './screens/Cafe';
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

export type RootTabList = {
  Meal: undefined;
  Mart: undefined;
  Cafe: undefined;
  Shuttle: undefined;
  Etcs: undefined;
};

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NativeBaseProvider>
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
            component={Cafe}
            options={{
              tabBarIcon: () => <CafeIcon />,
            }}
          />
          <Tab.Screen
            name="편의점"
            component={Mart}
            options={{
              tabBarIcon: () => <MartIcon />,
            }}
          />
          <Tab.Screen
            name="셔틀"
            component={Shuttle}
            options={{
              tabBarIcon: () => <ShuttleIcon />,
            }}
          />
          <Tab.Screen
            name="기타"
            component={Etcs}
            options={{
              tabBarIcon: () => <EtcsIcon />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
}

const style = StyleSheet.create({});

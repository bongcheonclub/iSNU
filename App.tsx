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
import axios from 'axios';
import {chain, map} from 'lodash';
import {parse} from 'node-html-parser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {theme} from './ui/theme';

export const FAVORITE_STORAGE_KEY = {
  cafe: 'favoriteCafeList',
  mart: 'favoriteMartList',
  shuttle: 'favoriteShuttleList',
};

async function initializeData() {
  const [
    [res, martRes],
    [favoriteCafeList, favoriteMartList, favoriteShuttleList],
  ] = await Promise.all([
    Promise.all([
      axios.get('https://snuco.snu.ac.kr/ko/node/21'),
      axios.get('https://snuco.snu.ac.kr/ko/node/19'),
    ]),
    Promise.all(map(FAVORITE_STORAGE_KEY, key => AsyncStorage.getItem(key))),
  ]);

  const initialFavoriteCafes = favoriteCafeList
    ? JSON.parse(favoriteCafeList)
    : [];

  const initialFavoriteMarts = favoriteMartList
    ? JSON.parse(favoriteMartList)
    : [];

  const initialFavoriteShuttles = favoriteShuttleList
    ? JSON.parse(favoriteShuttleList)
    : [];
  const html = res.data;
  const root = parse(html);
  const cafes = chain(root.querySelector('tbody').childNodes)
    .map(trNode => {
      const trTexts = chain(trNode.childNodes)
        .map(tdNode =>
          tdNode.innerText
            .split(/\s|\t|\n/)
            .filter(item => item.length > 0)
            .join(' '),
        )
        .filter(rows => rows.length > 0)
        .value();
      const [
        nameWithContact,
        location,
        size,
        items,
        weekday,
        saturday,
        holiday,
      ] = trTexts;
      const [name, contact] = nameWithContact.split(/\(|\)/);
      return {
        name,
        contact,
        location,
        size,
        items,
        weekday,
        saturday,
        holiday,
      };
    })
    .value();
  const martHtml = martRes.data;
  const martRoot = parse(martHtml);
  const marts = chain(martRoot.querySelector('tbody').childNodes)
    .map(trNode => {
      const trTexts = chain(trNode.childNodes)
        .map(tdNode =>
          tdNode.innerText
            .split(/\s|\t|\n/)
            .filter(item => item.length > 0)
            .join(' '),
        )
        .filter(rows => rows.length > 0)
        .value();
      const [name, location, items, weekday, saturday, holiday, contact] =
        trTexts;
      return {
        name,
        location,
        items,
        weekday,
        saturday,
        holiday,
        contact,
      };
    })
    .value();

  return {
    cafes,
    marts,
    initialFavoriteCafes,
    initialFavoriteMarts,
    initialFavoriteShuttles,
  };
}

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

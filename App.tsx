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
        <Tab.Navigator initialRouteName={'Mart'}>
          <Tab.Screen name="식당" component={Meal} />
          <Tab.Screen
            name="카페"
            component={Cafe}
            // options={{
            //   tabBarIcon: ({focused, color, size}) => (
            //     <Icon name="search" size={focused ? '30' : '25'} color="white" />
            //   ),
            // }}
          />
          <Tab.Screen
            name="편의점"
            component={Mart}
            // options={{
            //   tabBarIcon: ({focused, color, size}) => (
            //     <Icon name="upload" size={focused ? '30' : '25'} color="white" />
            //   ),
            // }}
          />
          <Tab.Screen
            name="셔틀"
            component={Shuttle}
            // options={{
            //   tabBarIcon: ({focused, color, size}) => (
            //     <Icon name="shop" size={focused ? '30' : '25'} color="white" />
            //   ),
            // }}
          />
          <Tab.Screen
            name="기타 편의정보"
            component={Etcs}
            // options={{
            //   tabBarIcon: ({focused, color, size}) => (
            //     <View>
            //       <Image
            //         style={
            //           focused ? style.focusedProfileImage : style.profileImage
            //         }
            //         source={ProfileImage}
            //       />
            //     </View>
            //   ),
            // }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
}

const style = StyleSheet.create({});

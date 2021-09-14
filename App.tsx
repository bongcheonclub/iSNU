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
    <NavigationContainer>
      <Tab.Navigator initialRouteName={'Meal'}>
        <Tab.Screen name="Meal" component={Meal} />
        <Tab.Screen
          name="Cafe"
          component={Cafe}
          // options={{
          //   tabBarIcon: ({focused, color, size}) => (
          //     <Icon name="search" size={focused ? '30' : '25'} color="white" />
          //   ),
          // }}
        />
        <Tab.Screen
          name="Mart"
          component={Mart}
          // options={{
          //   tabBarIcon: ({focused, color, size}) => (
          //     <Icon name="upload" size={focused ? '30' : '25'} color="white" />
          //   ),
          // }}
        />
        <Tab.Screen
          name="Shuttle"
          component={Shuttle}
          // options={{
          //   tabBarIcon: ({focused, color, size}) => (
          //     <Icon name="shop" size={focused ? '30' : '25'} color="white" />
          //   ),
          // }}
        />
        <Tab.Screen
          name="Etcs"
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
  );
}

const style = StyleSheet.create({});

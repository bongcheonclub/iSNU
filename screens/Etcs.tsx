import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {Box, Center, Button, ScrollView, VStack, Text} from 'native-base';
import React, {useState} from 'react';
import {Keyboard, StyleSheet} from 'react-native';
import {RootTabList} from '../App';
import {colors} from '../ui/colors';

type Props = BottomTabScreenProps<RootTabList, 'Etcs'>;

export default function Etcs({navigation}: Props) {
  const name = '은행';
  return (
    <Box>
      <ScrollView bgColor={colors.white}>
        <VStack>
          <Center>
            <Button
              rounded="10px"
              width="315px"
              height="72px"
              bgColor={colors.grey[100]}
              borderWidth={2}
              borderColor={colors.grey[200]}>
              <Text
                color={colors.grey[400]}
                // fontFamily="Noto Sans KR"
                fontSize="25px"
                fontWeight="500">
                {name}
              </Text>
            </Button>
          </Center>
        </VStack>
      </ScrollView>
    </Box>
  );
}

const style = StyleSheet.create({});

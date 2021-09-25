import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {Box, Center, Button, ScrollView, VStack, Text} from 'native-base';
import {color} from 'native-base/lib/typescript/theme/styled-system';
import React, {useState} from 'react';
import {Keyboard, StyleSheet} from 'react-native';
import {RootTabList} from '../App';
import {colors} from '../ui/colors';

type Props = BottomTabScreenProps<RootTabList, 'Etcs'>;

export default function Etcs({navigation}: Props) {
  return (
    <Box>
      <ScrollView bgColor={colors.white}>
        <VStack>
          <Center margin={2.5}>
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
                은행
              </Text>
            </Button>
          </Center>
          <Center margin={2.5}>
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
                우체국
              </Text>
            </Button>
          </Center>
          <Center margin={2.5}>
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
                교보문고
              </Text>
            </Button>
          </Center>
          <Center margin={2.5}>
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
                도서관
              </Text>
            </Button>
          </Center>
          <Center margin={2.5}>
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
                보건진료소
              </Text>
            </Button>
          </Center>
          <Center margin={2.5}>
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
                기숙사 편의시설
              </Text>
            </Button>
          </Center>
        </VStack>
      </ScrollView>
    </Box>
  );
}

const style = StyleSheet.create({});

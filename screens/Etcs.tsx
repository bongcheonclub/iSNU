import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {
  Box,
  Center,
  Button,
  ScrollView,
  VStack,
  Text,
  Modal,
  Divider,
} from 'native-base';
import {WebView} from 'react-native-webview';
import {color} from 'native-base/lib/typescript/theme/styled-system';
import React, {useState} from 'react';
import {Keyboard, StyleSheet} from 'react-native';
import {RootTabList} from '../App';
import {colors} from '../ui/colors';

type Props = BottomTabScreenProps<RootTabList, 'Etcs'>;

export default function Etcs({navigation}: Props) {
  const [focusedEtc, setFocusedEtc] = useState<string | null>(null);

  return (
    <Box>
      {focusedEtc ? (
        <>
          <Modal
            isOpen={focusedEtc === 'Bank'}
            onClose={() => setFocusedEtc(null)}>
            <Modal.Content>
              <Modal.CloseButton />
              <Modal.Body>
                <Text>은행</Text>
                <Text>평일 09:00 ~ 16:00 운영</Text>
                <Text>은행 위치</Text>
                <Divider />
                <Text>우리 4동 인문대 신양학술정보관 1층</Text>
                <Divider />
                <Text>농협 301동 제1공학관 1층</Text>
                <Divider />
                <Text>농협 940동 연구공원 지원시설 1층</Text>
                <Divider />
                <Text>농협 58동 SK경영관 1층</Text>
                <Divider />
                <Text>농협 109동 자하연식당 1층</Text>
                <Divider />
                <Text>농협 200동 농생대 2층</Text>
                <Divider />
                <Text>신한 63동 학생회관 1층</Text>
                <Divider />
                <Text>신한 44-1동 공대 신양학술정보관 1층</Text>
                <Divider />
                <Text>신한 941동 연구공원 백학어린이집 1층</Text>
              </Modal.Body>
            </Modal.Content>
          </Modal>
          <Modal
            isOpen={focusedEtc === 'Post'}
            onClose={() => setFocusedEtc(null)}>
            <Modal.Content>
              <Modal.CloseButton />
              <Modal.Body>
                <Text>우체국</Text>
                <Text>위치 행정관 1층 (학생식당 앞)</Text>
                <Divider />
                <Text>
                  운영시간 평일 09:00 ~ 18:00 (금융서비스: 09:00 ~ 16:30)
                </Text>
                <Divider />
                <Text>연락처 02-889-0205</Text>
              </Modal.Body>
            </Modal.Content>
          </Modal>
          <Modal
            isOpen={focusedEtc === 'Book'}
            onClose={() => setFocusedEtc(null)}>
            <Modal.Content>
              <Modal.CloseButton />
              <Modal.Body>
                <Text>서점임</Text>
              </Modal.Body>
            </Modal.Content>
          </Modal>
          <Modal
            isOpen={focusedEtc === 'Library'}
            onClose={() => setFocusedEtc(null)}
            size="full"
            animation="ease-in"
            height="100%">
            <Modal.Content height="100%">
              <Modal.CloseButton />
              <WebView
                height="100%"
                width="100%"
                source={{uri: 'http://google.com/'}}
              />
            </Modal.Content>
          </Modal>
        </>
      ) : null}
      <ScrollView bgColor={colors.white}>
        <VStack>
          <Center margin={2.5}>
            <Button
              onPress={() => setFocusedEtc('Bank')}
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
              onPress={() => setFocusedEtc('Post')}
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
              onPress={() => setFocusedEtc('Book')}
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
              onPress={() => setFocusedEtc('Library')}
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

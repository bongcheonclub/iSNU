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
import React, {useState} from 'react';
import {Keyboard, StyleSheet, Dimensions} from 'react-native';
import {colors} from '../ui/colors';
import {ParamListBase} from '@react-navigation/native';

type Props = BottomTabScreenProps<ParamListBase, '기타'>;

export default function Etcs({navigation}: Props) {
  const [focusedEtc, setFocusedEtc] = useState<string | null>(null);
  const webViewHeight = Dimensions.get('window').height;

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
                <Text>교보문고</Text>
                <Text>위치 학생회관 1층</Text>
                <Divider />
                <Text>
                  운영시간 평일 08:30 ~ 19:00 토요일 10:00 ~ 17:00 (일요일,
                  공휴일 휴무)
                </Text>
                <Divider />
                <Text>연락처 02-880-8581</Text>
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
                source={{uri: 'https://lib.snu.ac.kr/hours'}}
              />
            </Modal.Content>
          </Modal>
          <Modal
            isOpen={focusedEtc === 'PHC'}
            onClose={() => setFocusedEtc(null)}
            size="full"
            animation="ease-in"
            height="100%">
            <Modal.Content height="100%">
              <Modal.CloseButton />
              <WebView
                height="100%"
                width="100%"
                source={{
                  uri: 'https://m.health4u.snu.ac.kr/medicalTreatment/PracticeSchedule/_/view.do',
                }}
              />
            </Modal.Content>
          </Modal>
          <Modal
            isOpen={focusedEtc === 'Dorm'}
            onClose={() => setFocusedEtc(null)}
            size="full"
            animation="ease-in"
            height="100%">
            <Modal.Content height="100%">
              <Modal.CloseButton />
              <WebView
                height="100%"
                width="100%"
                source={{
                  uri: 'https://snudorm.snu.ac.kr/%ec%83%9d%ed%99%9c%ec%95%88%eb%82%b4/%ed%8e%b8%ec%9d%98%ec%8b%9c%ec%84%a4/%ec%9d%8c%ec%8b%9d/',
                }}
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
              onPress={() => setFocusedEtc('PHC')}
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
              onPress={() => setFocusedEtc('Dorm')}
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

import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {
  Box,
  Center,
  Button,
  ScrollView,
  VStack,
  Text,
  Modal,
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
      <Box>
        {focusedEtc ? (
          <>
            <Modal
              isOpen={focusedEtc === 'Bank'}
              onClose={() => setFocusedEtc(null)}>
              <Modal.Content>
                <Modal.CloseButton />
                <Modal.Body>
                  <Text>은행임</Text>
                </Modal.Body>
              </Modal.Content>
            </Modal>
            <Modal
              isOpen={focusedEtc === 'Post'}
              onClose={() => setFocusedEtc(null)}>
              <Modal.Content>
                <Modal.CloseButton />
                <Modal.Body>
                  <Text>우체국임</Text>
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
                <Modal.Body>
                  <WebView source={{uri: 'https://google.com/'}} />
                </Modal.Body>
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
    </Box>
  );
}

const style = StyleSheet.create({});

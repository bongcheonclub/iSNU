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
  HStack,
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
    <Box height="100%">
      {focusedEtc ? (
        <>
          <Modal
            isOpen={focusedEtc === 'Bank'}
            onClose={() => setFocusedEtc(null)}>
            <Modal.Content padding={0} width="90%">
              <Modal.CloseButton />
              <Modal.Body>
                <Box margin={6} marginBottom={1}>
                  <HStack left={-15} top={-15}>
                    <Text variant="modalTitle" marginBottom={1}>
                      은행
                    </Text>
                  </HStack>
                  <Text variant="modalSubInfo" left={-15} top={-20}>
                    평일 09:00 ~ 16:00 운영
                  </Text>
                </Box>
                <VStack>
                  <HStack width="100%">
                    <Text width="20%" variant="modalSubInfo" textAlign="center">
                      은행
                    </Text>
                    <Text width="80%" variant="modalSubInfo" textAlign="center">
                      위치
                    </Text>
                  </HStack>
                  <Divider
                    my={2}
                    bg="black"
                    width="100%"
                    marginTop="14px"
                    marginBottom="14px"
                  />
                  <HStack width="100%">
                    <Text
                      width="20%"
                      variant="modalSubContent"
                      textAlign="center">
                      우리
                    </Text>

                    <Text
                      width="80%"
                      variant="modalSubContent"
                      textAlign="center">
                      4동 인문대 신양학술정보관 1층
                    </Text>
                  </HStack>
                  <Divider
                    my={2}
                    bg="black"
                    width="100%"
                    marginTop="14px"
                    marginBottom="14px"
                  />
                  <HStack width="100%">
                    <Text
                      width="20%"
                      variant="modalSubContent"
                      textAlign="center">
                      농협
                    </Text>
                    <Text
                      width="80%"
                      variant="modalSubContent"
                      textAlign="center">
                      109동 자하연식당 1층
                    </Text>
                  </HStack>
                  <Divider
                    my={2}
                    bg="black"
                    width="100%"
                    marginTop="14px"
                    marginBottom="14px"
                  />
                  <HStack width="100%">
                    <Text
                      width="20%"
                      variant="modalSubContent"
                      textAlign="center">
                      농협
                    </Text>
                    <Text
                      width="80%"
                      variant="modalSubContent"
                      textAlign="center">
                      58동 SK경영관 1층
                    </Text>
                  </HStack>
                  <Divider
                    my={2}
                    bg="black"
                    width="100%"
                    marginTop="14px"
                    marginBottom="14px"
                  />
                  <HStack width="100%">
                    <Text
                      width="20%"
                      variant="modalSubContent"
                      textAlign="center">
                      농협
                    </Text>
                    <Text
                      width="80%"
                      variant="modalSubContent"
                      textAlign="center">
                      200동 농생대 2층
                    </Text>
                  </HStack>
                  <Divider
                    my={2}
                    bg="black"
                    width="100%"
                    marginTop="14px"
                    marginBottom="14px"
                  />
                  <HStack width="100%">
                    <Text
                      width="20%"
                      variant="modalSubContent"
                      textAlign="center">
                      농협
                    </Text>
                    <Text
                      width="80%"
                      variant="modalSubContent"
                      textAlign="center">
                      301동 제1공학관 1층
                    </Text>
                  </HStack>
                  <Divider
                    my={2}
                    bg="black"
                    width="100%"
                    marginTop="14px"
                    marginBottom="14px"
                  />
                  <HStack width="100%">
                    <Text
                      width="20%"
                      variant="modalSubContent"
                      textAlign="center">
                      농협
                    </Text>
                    <Text
                      width="80%"
                      variant="modalSubContent"
                      textAlign="center">
                      940동 연구공원 지원시설 1층
                    </Text>
                  </HStack>
                  <Divider
                    my={2}
                    bg="black"
                    width="100%"
                    marginTop="14px"
                    marginBottom="14px"
                  />
                  <HStack width="100%">
                    <Text
                      width="20%"
                      variant="modalSubContent"
                      textAlign="center">
                      신한
                    </Text>
                    <Text
                      width="80%"
                      variant="modalSubContent"
                      textAlign="center">
                      63동 학생회관 1층
                    </Text>
                  </HStack>
                  <Divider
                    my={2}
                    bg="black"
                    width="100%"
                    marginTop="14px"
                    marginBottom="14px"
                  />
                  <HStack width="100%">
                    <Text
                      width="20%"
                      variant="modalSubContent"
                      textAlign="center">
                      신한
                    </Text>
                    <Text
                      width="80%"
                      variant="modalSubContent"
                      textAlign="center">
                      44-1동 공대 신양학술정보관 1층
                    </Text>
                  </HStack>
                  <Divider
                    my={2}
                    bg="black"
                    width="100%"
                    marginTop="14px"
                    marginBottom="14px"
                  />
                  <HStack width="100%">
                    <Text
                      width="20%"
                      variant="modalSubContent"
                      textAlign="center">
                      신한
                    </Text>
                    <Text
                      width="80%"
                      variant="modalSubContent"
                      textAlign="center"
                      marginBottom="20px">
                      941동 연구공원 백학어린이집 1층
                    </Text>
                  </HStack>
                </VStack>
              </Modal.Body>
            </Modal.Content>
          </Modal>
          <Modal
            isOpen={focusedEtc === 'Post'}
            onClose={() => setFocusedEtc(null)}>
            <Modal.Content width="90%">
              <Modal.CloseButton />
              <Modal.Body>
                <Box margin={6} marginBottom={1}>
                  <HStack left={-15} top={-15}>
                    <Text variant="modalTitle" marginBottom={1}>
                      우체국
                    </Text>
                  </HStack>
                </Box>
                <VStack>
                  <HStack width="100%">
                    <Text
                      width="25%"
                      variant="modalSubContent"
                      textAlign="center">
                      위치
                    </Text>
                    <Text
                      width="75%"
                      variant="modalSubContent"
                      textAlign="center">
                      행정관 1층 (학생회관 식당 앞)
                    </Text>
                  </HStack>
                  <Divider
                    my={2}
                    bg="black"
                    width="100%"
                    marginTop="14px"
                    marginBottom="14px"
                  />
                  <HStack width="100%" alignItems="center">
                    <Text
                      width="25%"
                      variant="modalSubContent"
                      textAlign="center">
                      운영시간
                    </Text>
                    <VStack width="75%">
                      <Text variant="modalSubContent" textAlign="center">
                        평일 09:00 ~ 18:00
                      </Text>
                      <Text variant="modalSubContent" textAlign="center">
                        (금융서비스: 09:00 ~ 16:30)
                      </Text>
                    </VStack>
                  </HStack>
                  <Divider
                    my={2}
                    bg="black"
                    width="100%"
                    marginTop="14px"
                    marginBottom="14px"
                  />
                  <HStack width="100%">
                    <Text
                      width="25%"
                      variant="modalSubContent"
                      textAlign="center">
                      연락처
                    </Text>
                    <Text
                      width="75%"
                      variant="modalSubContent"
                      textAlign="center"
                      marginBottom="20px">
                      02-889-0205
                    </Text>
                  </HStack>
                </VStack>
              </Modal.Body>
            </Modal.Content>
          </Modal>
          <Modal
            isOpen={focusedEtc === 'Book'}
            onClose={() => setFocusedEtc(null)}>
            <Modal.Content width="90%">
              <Modal.CloseButton />
              <Modal.Body>
                <Box margin={6} marginBottom={1}>
                  <HStack left={-15} top={-15}>
                    <Text variant="modalTitle" marginBottom={1}>
                      교보문고
                    </Text>
                  </HStack>
                </Box>
                <VStack>
                  <HStack width="100%">
                    <Text
                      width="25%"
                      variant="modalSubContent"
                      textAlign="center">
                      위치
                    </Text>
                    <Text
                      width="75%"
                      variant="modalSubContent"
                      textAlign="center">
                      학생회관 1층
                    </Text>
                  </HStack>
                  <Divider
                    my={2}
                    bg="black"
                    width="100%"
                    marginTop="14px"
                    marginBottom="14px"
                  />
                  <HStack width="100%" alignItems="center">
                    <Text
                      width="25%"
                      variant="modalSubContent"
                      textAlign="center">
                      운영시간
                    </Text>
                    <VStack width="75%">
                      <Text variant="modalSubContent" textAlign="center">
                        평일 08:30 ~ 19:00
                      </Text>
                      <Text variant="modalSubContent" textAlign="center">
                        토요일 10:00 ~ 17:00
                      </Text>
                      <Text variant="modalSubContent" textAlign="center">
                        (일요일, 공휴일 휴무)
                      </Text>
                    </VStack>
                  </HStack>
                  <Divider
                    my={2}
                    bg="black"
                    width="100%"
                    marginTop="14px"
                    marginBottom="14px"
                  />
                  <HStack width="100%">
                    <Text
                      width="25%"
                      variant="modalSubContent"
                      textAlign="center">
                      연락처
                    </Text>
                    <Text
                      width="75%"
                      variant="modalSubContent"
                      textAlign="center"
                      marginBottom="20px">
                      02-880-8581
                    </Text>
                  </HStack>
                </VStack>
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
              variant="place">
              <Text variant="normalOpenPlaceBig">은행</Text>
            </Button>
          </Center>
          <Center margin={2.5}>
            <Button
              onPress={() => setFocusedEtc('Post')}
              rounded="10px"
              width="315px"
              height="72px"
              variant="place">
              <Text variant="normalOpenPlaceBig">우체국</Text>
            </Button>
          </Center>
          <Center margin={2.5}>
            <Button
              onPress={() => setFocusedEtc('Book')}
              rounded="10px"
              width="315px"
              height="72px"
              variant="place">
              <Text variant="normalOpenPlaceBig">교보문고</Text>
            </Button>
          </Center>
          <Center margin={2.5}>
            <Button
              onPress={() => setFocusedEtc('Library')}
              rounded="10px"
              width="315px"
              height="72px"
              variant="place">
              <Text variant="normalOpenPlaceBig">도서관</Text>
            </Button>
          </Center>
          <Center margin={2.5}>
            <Button
              onPress={() => setFocusedEtc('PHC')}
              rounded="10px"
              width="315px"
              height="72px"
              variant="place">
              <Text variant="normalOpenPlaceBig">보건진료소</Text>
            </Button>
          </Center>
          <Center margin={2.5}>
            <Button
              onPress={() => setFocusedEtc('Dorm')}
              rounded="10px"
              width="315px"
              height="72px"
              variant="place">
              <Text variant="normalOpenPlaceBig">기숙사 편의시설</Text>
            </Button>
          </Center>
        </VStack>
      </ScrollView>
    </Box>
  );
}

const style = StyleSheet.create({});

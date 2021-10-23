import {
  Box,
  Center,
  Modal,
  TextArea,
  VStack,
  HStack,
  IBoxProps,
} from 'native-base';
import React, {useCallback, useState} from 'react';
import {Keyboard, Dimensions, Linking} from 'react-native';
import Text from './Text';
import Button from './WrappedButton';
import Pressable from './WrappedPressable';
import {slack} from '../helpers/axios';
import KebabIcon from '../icons/kebab.svg';
import PressedKebabIcon from '../icons/kebab-pressed.svg';
import OutlinkIcon from '../icons/outlink.svg';
import PressedOutlinkIcon from '../icons/outlink-pressed.svg';
import BackIcon from '../icons/back.svg';
import PressedBackIcon from '../icons/back-pressed.svg';
import {theme} from '../ui/theme';
import amplitude from '../helpers/amplitude';
import {getDeviceId} from 'react-native-device-info';

async function submitToSlack(type: string, contents: string) {
  const [deviceType, deviceId, sessionId] = await Promise.all([
    getDeviceId(),
    amplitude.getDeviceId(),
    amplitude.getSessionId(),
  ]);
  try {
    const textLines = [
      `deviceType: ${deviceType}`,
      `deviceId: ${deviceId}`,
      `sessionId: ${sessionId}`,
      `내용: ${contents}`,
    ];
    await slack.post('', {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: type,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: textLines.join('\n'),
          },
        },
      ],
    });
  } catch (e) {
    console.error(e);
  }
}

export default function MoreModal(props: IBoxProps<null>) {
  const [status, setStatus] = useState<
    'tip' | 'suggest' | 'main' | 'submitTip' | 'submitSuggest' | null
  >(null);
  const [nextState, setNextState] = useState<'main' | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState<boolean>(false);
  const [showCloseDialog, setShowCloseDialog] = useState<boolean>(false);
  const [tipInput, setTipInput] = useState<string>('');
  const [suggestInput, setSuggestInput] = useState<string>('');
  const windowWidth = Dimensions.get('window').width;

  const handleSubmitSuggest = useCallback(async () => {
    setShowSubmitDialog(false);
    setStatus('submitSuggest');
    setSuggestInput('');
    await submitToSlack('기능 추가 건의', suggestInput);
  }, [suggestInput]);

  const handleSubmitTip = useCallback(async () => {
    setShowSubmitDialog(false);
    setStatus('submitTip');
    setTipInput('');
    await submitToSlack('잘못된 정보 제보', tipInput);
  }, [tipInput]);

  const handleTipInput = useCallback((text: string) => {
    setTipInput(text);
  }, []);

  const handleSuggestInput = useCallback((text: string) => {
    setSuggestInput(text);
  }, []);

  function handleClose(preState: string | null) {
    switch (preState) {
      case 'main':
        return setStatus(null);
      case 'tip':
        if (!tipInput.trim()) {
          return setStatus(null);
        } else {
          setNextState(null);
          return setShowCloseDialog(true);
        }
      case 'suggest':
        if (!suggestInput.trim()) {
          return setStatus(null);
        } else {
          setNextState(null);
          return setShowCloseDialog(true);
        }
      case 'submitTip':
        return setStatus(null);
      case 'submitSuggest':
        return setStatus(null);
      case 'back':
        setNextState('main');
        if (status === 'tip' && !!tipInput.trim()) {
          return setShowCloseDialog(true);
        } else if (status === 'suggest' && !!suggestInput.trim()) {
          return setShowCloseDialog(true);
        } else {
          return setStatus('main');
        }
    }
  }

  return (
    <Box bottom="8px">
      <Pressable
        label="more"
        marginBottom="14px"
        paddingRight={windowWidth * 0.075}
        onPress={() => setStatus('main')}
        backgroundColor="transparent">
        {({isPressed}) => {
          return isPressed ? <PressedKebabIcon /> : <KebabIcon />;
        }}
      </Pressable>

      <Modal top="-10%" isOpen={!!status} onClose={() => handleClose(status)}>
        <Modal.Content
          backgroundColor={theme.colors.white}
          padding={0}
          width="90%">
          {status === 'main' && (
            <>
              <Modal.CloseButton />
              <Box margin="auto" my="5" alignItems="flex-end">
                <Pressable label="more-tip" onPress={() => setStatus('tip')}>
                  {({isPressed}) => {
                    return (
                      <Center flexDirection="row" my="3" w="72%" marginX="14%">
                        <Text
                          w="88%"
                          textAlign="left"
                          variant={
                            isPressed ? 'pressedModalTitle' : 'moreModalTitle'
                          }>
                          잘못된 정보 제보하기
                        </Text>
                        {isPressed ? <PressedOutlinkIcon /> : <OutlinkIcon />}
                      </Center>
                    );
                  }}
                </Pressable>
                <Pressable
                  label="more-suggest"
                  onPress={() => setStatus('suggest')}>
                  {({isPressed}) => {
                    return (
                      <Center flexDirection="row" my="3" w="72%" marginX="14%">
                        <Text
                          w="88%"
                          textAlign="left"
                          variant={
                            isPressed ? 'pressedModalTitle' : 'moreModalTitle'
                          }>
                          기능 추가 건의하기
                        </Text>
                        {isPressed ? <PressedOutlinkIcon /> : <OutlinkIcon />}
                      </Center>
                    );
                  }}
                </Pressable>
                <Pressable
                  label="more-developer-introduce"
                  onPress={() =>
                    Linking.openURL(
                      'https://wobby.notion.site/wobby/We-Work-as-a-Hobby-9c6a1081ecbf4885902962c0998bfd2c',
                    )
                  }>
                  {({isPressed}) => {
                    return (
                      <Center flexDirection="row" my="3" w="72%" marginX="14%">
                        <Text
                          w="88%"
                          textAlign="left"
                          variant={
                            isPressed ? 'pressedModalTitle' : 'moreModalTitle'
                          }>
                          개발자들 보러 가기
                        </Text>
                        {isPressed ? <PressedOutlinkIcon /> : <OutlinkIcon />}
                      </Center>
                    );
                  }}
                </Pressable>
              </Box>
            </>
          )}
          {status === 'tip' && (
            <Pressable
              label="more-tip-keyboard-dismiss"
              onPress={Keyboard.dismiss}>
              <Box>
                <Modal.CloseButton onPress={() => handleClose('tip')} />
                <Modal.Header
                  borderColor={theme.colors.blue[100]}
                  paddingLeft="16px"
                  py="12px"
                  display="flex"
                  alignItems="center"
                  flexDir="row">
                  <Pressable
                    label="more-tip-back"
                    onPress={() => handleClose('back')}
                    marginRight={2}>
                    {({isPressed}) => {
                      return isPressed ? <PressedBackIcon /> : <BackIcon />;
                    }}
                  </Pressable>
                  <Text variant="modalSubContent">잘못된 정보 제보하기</Text>
                </Modal.Header>
                <TextArea
                  height="120px"
                  textAlignVertical="top"
                  rounded="0"
                  underlineColorAndroid="transparent"
                  onChangeText={handleTipInput}
                  _focus={{
                    borderColor: 'blue.100',
                  }}
                  size="md"
                  placeholder="내용 입력하기"
                />
                <Modal.Footer
                  backgroundColor={theme.colors.white}
                  paddingTop="10px">
                  <Button
                    label="more-tip-submit"
                    onPress={() => setShowSubmitDialog(true)}
                    variant="submitButton"
                    isDisabled={!tipInput.trim()}>
                    <Text variant="submitButton">제출하기</Text>
                  </Button>
                </Modal.Footer>
              </Box>
            </Pressable>
          )}
          {status === 'suggest' && (
            <Pressable
              label="more-suggest-keyboard-dismiss"
              onPress={Keyboard.dismiss}>
              <Box>
                <Modal.CloseButton onPress={() => handleClose('suggest')} />
                <Modal.Header
                  borderColor={theme.colors.blue[100]}
                  paddingLeft="16px"
                  py="12px"
                  display="flex"
                  alignItems="center"
                  flexDir="row">
                  <Pressable
                    label="more-suggest-back"
                    onPress={() => handleClose('back')}
                    marginRight={2}>
                    {({isPressed}) => {
                      return isPressed ? <PressedBackIcon /> : <BackIcon />;
                    }}
                  </Pressable>
                  <Text variant="modalSubContent">기능 추가 건의하기</Text>
                </Modal.Header>
                <TextArea
                  height="120px"
                  textAlignVertical="top"
                  rounded="0"
                  underlineColorAndroid="transparent"
                  onChangeText={handleSuggestInput}
                  _focus={{
                    borderColor: 'blue.100',
                  }}
                  size="md"
                  placeholder="내용 입력하기"
                />
                <Modal.Footer
                  backgroundColor={theme.colors.white}
                  paddingTop="10px">
                  <Button
                    label="more-suggest-submit"
                    onPress={() => setShowSubmitDialog(true)}
                    variant="submitButton"
                    isDisabled={!suggestInput.trim()}>
                    <Text variant="submitButton">제출하기</Text>
                  </Button>
                </Modal.Footer>
              </Box>
            </Pressable>
          )}
          {status === 'submitTip' && (
            <Box>
              <VStack width="100%" marginTop="20px" alignItems="center">
                <Text
                  color={theme.colors.black}
                  fontSize="20px"
                  fontWeight="400">
                  소중한 의견 감사합니다!
                </Text>
                <Text
                  color={theme.colors.black}
                  fontSize="15px"
                  fontWeight="300"
                  marginTop="10px">
                  보내주신 부분은 빠른 시일내에 수정하겠습니다.
                </Text>
                <Button
                  label="more-tip-submit-close"
                  marginTop="20px"
                  width="100%"
                  variant="closeButton"
                  borderTopWidth="1px"
                  onPress={() => setStatus(null)}>
                  <Text variant="closeButton" height="32px">
                    닫기
                  </Text>
                </Button>
              </VStack>
            </Box>
          )}
          {status === 'submitSuggest' && (
            <Box>
              <VStack width="100%" marginTop="20px" alignItems="center">
                <Text
                  color={theme.colors.black}
                  fontSize="20px"
                  fontWeight="400">
                  소중한 의견 감사합니다!
                </Text>
                <Text
                  color={theme.colors.black}
                  fontSize="15px"
                  fontWeight="300"
                  marginTop="10px">
                  보내주신 의견은 논의 후 반영하겠습니다.
                </Text>
                <Button
                  label="more-suggest-submit-close"
                  marginTop="20px"
                  width="100%"
                  variant="closeButton"
                  borderTopWidth="1px"
                  onPress={() => setStatus(null)}>
                  <Text variant="closeButton" height="32px">
                    닫기
                  </Text>
                </Button>
              </VStack>
            </Box>
          )}
        </Modal.Content>
      </Modal>
      <Modal
        top="-10%"
        isOpen={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}>
        <Modal.Content width="80%" padding="5px" bg={theme.colors.gray[100]}>
          <VStack width="100%" marginTop="20px" alignItems="center">
            <Text color={theme.colors.black} fontSize="18px" fontWeight="400">
              제출하시겠습니까?
            </Text>
            <Text color={theme.colors.black} fontSize="15px" fontWeight="300">
              작성하신 내용이 개발자들에게 전달됩니다.
            </Text>
            <HStack
              marginTop="20px"
              width="100%"
              justifyContent="space-between">
              <Button
                label="more-submit-cancel"
                width="50%"
                variant="closeButton"
                borderWidth="1px"
                borderLeftWidth="0"
                borderBottomWidth="0"
                onPress={() => setShowSubmitDialog(false)}>
                <Text variant="closeButton" fontWeight="300">
                  취소
                </Text>
              </Button>
              <Button
                label="more-submit-accept"
                width="50%"
                variant="closeButton"
                borderTopWidth="1px"
                onPress={
                  status === 'suggest' ? handleSubmitSuggest : handleSubmitTip
                }>
                <Text variant="closeButton" fontWeight="400">
                  보내기
                </Text>
              </Button>
            </HStack>
          </VStack>
        </Modal.Content>
      </Modal>
      <Modal
        top="-10%"
        isOpen={showCloseDialog}
        onClose={() => setShowCloseDialog(false)}>
        <Modal.Content width="80%" padding="5px" bg={theme.colors.gray[100]}>
          <VStack width="100%" marginTop="20px" alignItems="center">
            <Text color={theme.colors.black} fontSize="18px" fontWeight="400">
              나가시겠습니까?
            </Text>
            <Text color={theme.colors.black} fontSize="15px" fontWeight="300">
              작성중인 내용이 저장되지 않고 사라집니다.
            </Text>
            <HStack
              marginTop="20px"
              width="100%"
              justifyContent="space-between">
              <Button
                label="more-exit-modal-cancel"
                width="50%"
                variant="closeButton"
                borderWidth="1px"
                borderLeftWidth="0"
                borderBottomWidth="0"
                onPress={() => setShowCloseDialog(false)}>
                <Text variant="closeButton" fontWeight="400">
                  취소
                </Text>
              </Button>
              <Button
                label="more-exit-modal-accept"
                width="50%"
                variant="closeButton"
                borderTopWidth="1px"
                onPress={() => {
                  setStatus(nextState);
                  setTipInput('');
                  setSuggestInput('');
                  setShowCloseDialog(false);
                }}>
                <Text variant="closeButton" fontWeight="300">
                  나가기
                </Text>
              </Button>
            </HStack>
          </VStack>
        </Modal.Content>
      </Modal>
    </Box>
  );
}

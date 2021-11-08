import {Box, Center, Modal, TextArea} from 'native-base';
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
import ExternalIcon from '../icons/external.svg';
import PressedExternalIcon from '../icons/external-pressed.svg';
import BackIcon from '../icons/back.svg';
import PressedBackIcon from '../icons/back-pressed.svg';
import {theme} from '../ui/theme';
import amplitude from '../helpers/amplitude';
import {getDeviceId} from 'react-native-device-info';
import SimpleDialog from './SimpleDialog';
import ConfirmDialog from './ConfirmDialog';

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

const FOCUSED_BORDER = {
  borderColor: 'blue.100',
};

export default function MoreModal() {
  const [status, setStatus] = useState<
    'tip' | 'suggest' | 'main' | 'submitTip' | 'submitSuggest' | 'exit'
  >('exit');
  const [isSubmitDialogShown, setSubmitDialogShown] = useState<boolean>(false);
  const [desireStateWithCloseDialog, setDesireStateWithShowCloseDialog] =
    useState<'main' | 'exit' | null>(null);
  const [tipInput, setTipInput] = useState<string>('');
  const [suggestInput, setSuggestInput] = useState<string>('');

  const windowWidth = Dimensions.get('window').width;

  const showSubmitDialog = useCallback(() => setSubmitDialogShown(true), []);
  const hideSubmitDialog = useCallback(() => setSubmitDialogShown(false), []);

  const hideCloseDialog = useCallback(
    () => setDesireStateWithShowCloseDialog(null),
    [],
  );
  const confirmCloseDialog = useCallback(() => {
    if (!desireStateWithCloseDialog) {
      return;
    }

    setStatus(desireStateWithCloseDialog);
    setTipInput('');
    setSuggestInput('');
    setDesireStateWithShowCloseDialog(null);
  }, [desireStateWithCloseDialog]);

  const handleSubmitSuggest = useCallback(async () => {
    setSubmitDialogShown(false);
    setStatus('submitSuggest');
    setSuggestInput('');
    await submitToSlack('기능 추가 건의', suggestInput);
  }, [suggestInput]);

  const handleSubmitTip = useCallback(async () => {
    setSubmitDialogShown(false);
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

  const handleClose = useCallback(() => {
    switch (status) {
      case 'main': {
        setStatus('exit');
        break;
      }
      case 'tip': {
        if (!tipInput.trim()) {
          setStatus('exit');
        } else {
          setDesireStateWithShowCloseDialog('exit');
        }
        break;
      }
      case 'suggest': {
        if (!suggestInput.trim()) {
          setStatus('exit');
        } else {
          setDesireStateWithShowCloseDialog('exit');
        }
        break;
      }
      case 'submitTip': {
        setStatus('exit');
        break;
      }

      case 'submitSuggest': {
        setStatus('exit');
        break;
      }
    }
  }, [status, suggestInput, tipInput]);

  const moveToMain = useCallback(() => setStatus('main'), []);
  const moveToTip = useCallback(() => setStatus('tip'), []);
  const moveToSuggest = useCallback(() => setStatus('suggest'), []);
  const exit = useCallback(() => setStatus('exit'), []);

  const linkToDevelopers = useCallback(
    () =>
      Linking.openURL(
        'https://wobby.notion.site/wobby/We-Work-as-a-Hobby-9c6a1081ecbf4885902962c0998bfd2c',
      ),
    [],
  );

  const handleBack = useCallback(() => {
    if (status === 'tip' && !!tipInput.trim()) {
      setDesireStateWithShowCloseDialog('main');
    } else if (status === 'suggest' && !!suggestInput.trim()) {
      setDesireStateWithShowCloseDialog('main');
    } else {
      setStatus('main');
    }
  }, [status, suggestInput, tipInput]);

  return (
    <Box bottom="8px">
      <Pressable
        label="more"
        marginBottom="14px"
        paddingRight={windowWidth * 0.075}
        onPress={moveToMain}
        backgroundColor="transparent">
        {({isPressed}) => {
          return isPressed ? <PressedKebabIcon /> : <KebabIcon />;
        }}
      </Pressable>

      <Modal top="-10%" isOpen={status !== 'exit'} onClose={handleClose}>
        <Modal.Content
          backgroundColor={theme.colors.white}
          padding={0}
          width="90%">
          {status === 'main' && (
            <>
              <Modal.CloseButton />
              <Box margin="auto" my="5" alignItems="flex-end">
                <Pressable label="more-tip" onPress={moveToTip}>
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
                <Pressable label="more-suggest" onPress={moveToSuggest}>
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
                  onPress={linkToDevelopers}>
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
                        {isPressed ? <PressedExternalIcon /> : <ExternalIcon />}
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
                <Modal.CloseButton onPress={handleClose} />
                <Modal.Header
                  borderColor={theme.colors.blue[100]}
                  paddingLeft="16px"
                  py="12px"
                  display="flex"
                  alignItems="center"
                  flexDir="row">
                  <Pressable
                    label="more-tip-back"
                    onPress={handleBack}
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
                  _focus={FOCUSED_BORDER}
                  size="md"
                  placeholder="내용 입력하기"
                />
                <Modal.Footer
                  backgroundColor={theme.colors.white}
                  paddingTop="10px">
                  <Button
                    label="more-tip-submit"
                    onPress={showSubmitDialog}
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
                <Modal.CloseButton onPress={handleClose} />
                <Modal.Header
                  borderColor={theme.colors.blue[100]}
                  paddingLeft="16px"
                  py="12px"
                  display="flex"
                  alignItems="center"
                  flexDir="row">
                  <Pressable
                    label="more-suggest-back"
                    onPress={handleBack}
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
                  _focus={FOCUSED_BORDER}
                  size="md"
                  placeholder="내용 입력하기"
                />
                <Modal.Footer
                  backgroundColor={theme.colors.white}
                  paddingTop="10px">
                  <Button
                    label="more-suggest-submit"
                    onPress={showSubmitDialog}
                    variant="submitButton"
                    isDisabled={!suggestInput.trim()}>
                    <Text variant="submitButton">제출하기</Text>
                  </Button>
                </Modal.Footer>
              </Box>
            </Pressable>
          )}
        </Modal.Content>
      </Modal>
      {status === 'submitTip' && (
        <SimpleDialog
          title="소중한 의견 감사합니다!"
          contents={'보내주신 부분은 빠른 시일내에 수정하겠습니다.'}
          onClose={exit}
        />
      )}
      {status === 'submitSuggest' && (
        <SimpleDialog
          title="소중한 의견 감사합니다!"
          contents={'보내주신 의견은 논의 후 반영하겠습니다.'}
          onClose={exit}
        />
      )}
      {isSubmitDialogShown && (
        <ConfirmDialog
          title="제출하시겠습니까?"
          contents="작성하신 내용이 개발자들에게 전달됩니다."
          onClose={hideSubmitDialog}
          onConfirm={
            status === 'suggest' ? handleSubmitSuggest : handleSubmitTip
          }
          confirmText="보내기"
        />
      )}
      {desireStateWithCloseDialog && (
        <ConfirmDialog
          title="나가시겠습니까?"
          contents="작성중인 내용이 저장되지 않고 사라집니다."
          onClose={hideCloseDialog}
          onConfirm={confirmCloseDialog}
          confirmText="나가기"
        />
      )}
    </Box>
  );
}

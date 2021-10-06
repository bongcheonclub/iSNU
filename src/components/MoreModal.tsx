import React, {useCallback, useState} from 'react';
import More from '../icons/more.svg';
import Outlink from '../icons/outlink.svg';
import getPublicIp from 'react-native-public-ip';
import {
  Box,
  Button,
  Center,
  Modal,
  Pressable,
  Text,
  TextArea,
} from 'native-base';
import {slack} from '../helpers/axios';
export default function MoreModal() {
  const [selectedMoreTap, setSelectedMoreTap] = useState<
    'tip' | 'suggest' | 'main' | null
  >(null);
  const [tipInput, setTipInput] = useState<string>('');
  const [suggestInput, setSuggestInput] = useState<string>('');

  const handleSubmitSuggest = useCallback(async () => {
    setSelectedMoreTap(null);
    setSuggestInput('');
    try {
      const textLines = [`내용: ${suggestInput}`];

      await slack.post('', {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '기능 추가 건의',
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
  }, [suggestInput]);

  const handleSubmitTip = useCallback(async () => {
    setSelectedMoreTap(null);
    setTipInput('');
    try {
      const ip = await getPublicIp();

      const textLines = [`ip: ${ip}`, `내용: ${tipInput}`];

      await slack.post('', {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '잘못된 정보 제보',
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
  }, [tipInput]);
  const handleBack = useCallback(() => {
    setSelectedMoreTap('main');
  }, []);

  const handleTipInput = useCallback((text: string) => {
    setTipInput(text);
  }, []);

  const handleSuggestInput = useCallback((text: string) => {
    setSuggestInput(text);
  }, []);
  return (
    <Box>
      <Button
        marginBottom="14px"
        marginRight="3"
        onPress={() => setSelectedMoreTap('main')}
        backgroundColor="transparent">
        <More />
      </Button>
      <Modal
        isOpen={!!selectedMoreTap}
        onClose={() => setSelectedMoreTap(null)}>
        <Modal.Content>
          {selectedMoreTap === 'main' && (
            <Modal.Body width="100%" paddingTop="32px" paddingRight="32px">
              <Modal.CloseButton />
              <Pressable onPress={() => setSelectedMoreTap('tip')}>
                <Center flexDirection="row">
                  <Text
                    marginLeft="auto"
                    marginRight="5px"
                    color="blue"
                    fontSize="25px"
                    fontWeight="extrabold">
                    잘못된 정보 제보하기
                  </Text>
                  <Outlink />
                </Center>
              </Pressable>
              <Pressable onPress={() => setSelectedMoreTap('suggest')}>
                <Center flexDirection="row">
                  <Text
                    marginLeft="auto"
                    marginRight="5px"
                    color="blue"
                    fontSize="25px"
                    fontWeight="extrabold">
                    기능 추가 건의하기
                  </Text>
                  <Outlink />
                </Center>
              </Pressable>
              <Pressable>
                <Center flexDirection="row">
                  <Text
                    marginLeft="auto"
                    marginRight="5px"
                    color="blue"
                    fontSize="25px"
                    fontWeight="extrabold">
                    개발자들 보러 가기
                  </Text>
                  <Outlink />
                </Center>
              </Pressable>
            </Modal.Body>
          )}
          {selectedMoreTap === 'tip' && (
            <Box>
              <Modal.Header display="flex" flexDir="row">
                <Pressable onPress={handleBack} marginRight={2}>
                  <Outlink />
                </Pressable>
                <Text>잘못된 정보 제보하기</Text>
                <Modal.CloseButton />
              </Modal.Header>
              <Modal.Body>
                <TextArea
                  height="200"
                  value={tipInput}
                  onChangeText={handleTipInput}
                  placeholder="내용 입력하기"
                />
              </Modal.Body>
              <Modal.Footer>
                <Button onPress={handleSubmitTip}>
                  <Text>제출하기</Text>
                </Button>
              </Modal.Footer>
            </Box>
          )}
          {selectedMoreTap === 'suggest' && (
            <Box>
              <Modal.Header display="flex" flexDir="row">
                <Pressable onPress={handleBack} marginRight={2}>
                  <Outlink />
                </Pressable>
                <Text>기능 추가 건의하기</Text>
                <Modal.CloseButton />
              </Modal.Header>
              <Modal.Body>
                <TextArea
                  height="200"
                  value={suggestInput}
                  onChangeText={handleSuggestInput}
                  placeholder="내용 입력하기"
                />
              </Modal.Body>
              <Modal.Footer>
                <Button onPress={handleSubmitSuggest}>
                  <Text>제출하기</Text>
                </Button>
              </Modal.Footer>
            </Box>
          )}
        </Modal.Content>
      </Modal>
    </Box>
  );
}

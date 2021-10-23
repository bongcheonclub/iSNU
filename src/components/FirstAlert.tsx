import React, {useCallback, useState} from 'react';
import {
  Box,
  HStack,
  Alert,
  VStack,
  IconButton,
  CloseIcon,
  Modal,
} from 'native-base';
import {setItem} from '../helpers/localStorage';
import Text from './Text';
import {Platform} from 'react-native';

const CustomCloseIcon = <CloseIcon size="3" color="coolGray.600" />;

const FirstAlert = (props: {wasViewedNotice: boolean}) => {
  const [displayNotice, setDisplayNotice] = useState(!props.wasViewedNotice);

  const handleClose = useCallback(() => {
    setDisplayNotice(false);
    setItem('wasViewedNotice', true);
  }, []);

  const handlePress = useCallback(() => {
    setDisplayNotice(false);
    setItem('wasViewedNotice', true);
  }, []);

  return displayNotice ? (
    <Modal isOpen={displayNotice} onClose={handleClose}>
      <Alert
        w="90%"
        status="info"
        colorScheme="info"
        marginX="5%"
        marginBottom={Platform.OS === 'android' ? '70px' : '100px'}
        bottom="0px"
        shadow={9}
        position="absolute">
        <VStack
          padding="2%"
          space={2}
          flexShrink={1}
          w="100%"
          alignItems="center"
          justifyContent="center">
          <HStack
            w="100%"
            flexShrink={1}
            space={2}
            alignItems="center"
            justifyContent="space-between">
            <Alert.Icon size="5" />
            <Text fontSize="md" fontWeight="medium" color="coolGray.800">
              코로나19 관련 운영시간 변동 안내
            </Text>
            <IconButton
              onPress={handlePress}
              variant="unstyled"
              icon={CustomCloseIcon}
            />
          </HStack>
          <Box w="100%">
            <Text color="coolGray.600" fontSize="16px" lineHeight="lg">
              {'\n'}모든 정보는 생활협동조합 홈페이지, 마이스누 포털 등을
              바탕으로 바탕으로 제공됩니다. {'\n\n'}다만 코로나19 상황에 따라 각
              매장의 실제 운영시간에 변동이 있을 수 있습니다.
              {'\n\n'}혹시 잘못된 정보를 확인하신 분들은 제보하기 기능을 통해
              제보해주시면 감사하겠습니다.{'\n\n'}저희도 앞으로 더 정확한 정보를
              제공하기 위하여 노력하겠습니다. 감사합니다.
            </Text>
          </Box>
        </VStack>
      </Alert>
    </Modal>
  ) : null;
};
export default FirstAlert;

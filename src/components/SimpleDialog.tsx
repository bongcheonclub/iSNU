import {Box, Modal, VStack} from 'native-base';
import React, {useCallback, useState} from 'react';
import Text from './Text';
import Button from './WrappedButton';
import {theme} from '../ui/theme';

type Props = {
  title: string;
  contents: string;
  onClose: () => void;
};

const SimpleDialog = ({title, contents, onClose}: Props) => {
  return (
    <Modal isOpen top="-10%" onClose={onClose}>
      <Modal.Content width="90%" padding="0px" bg={theme.colors.gray[100]}>
        <VStack width="100%" marginTop="20px" alignItems="center">
          <Text color={theme.colors.black} fontSize="20px" fontWeight="400">
            {title}
          </Text>
          <Text
            color={theme.colors.black}
            fontSize="15px"
            fontWeight="300"
            marginTop="10px">
            {contents}
          </Text>
          <Button
            label="dialog-close"
            marginTop="20px"
            width="100%"
            variant="closeButton"
            borderTopWidth="1px"
            onPress={onClose}>
            <Text variant="closeButton" height="32px">
              닫기
            </Text>
          </Button>
        </VStack>
      </Modal.Content>
    </Modal>
  );
};

export default SimpleDialog;

import {Modal, VStack, HStack} from 'native-base';
import React from 'react';
import Text from './Text';
import Button from './WrappedButton';
import {theme} from '../ui/theme';

type Props = {
  title: string;
  contents: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmText: string;
};

const ConfirmDialog = ({
  title,
  contents,
  onClose,
  onConfirm,
  confirmText,
}: Props) => {
  return (
    <Modal isOpen top="-10%" onClose={onClose}>
      <Modal.Content width="80%" padding="5px" bg={theme.colors.gray[100]}>
        <VStack width="100%" marginTop="20px" alignItems="center">
          <Text color={theme.colors.black} fontSize="18px" fontWeight="400">
            {title}
          </Text>
          <Text color={theme.colors.black} fontSize="15px" fontWeight="300">
            {contents}
          </Text>
          <HStack marginTop="20px" width="100%" justifyContent="space-between">
            <Button
              label="more-submit-cancel"
              width="50%"
              variant="closeButton"
              borderWidth="1px"
              borderLeftWidth="0"
              borderBottomWidth="0"
              onPress={onClose}>
              <Text variant="closeButton" fontWeight="300">
                취소
              </Text>
            </Button>
            <Button
              label="more-submit-accept"
              width="50%"
              variant="closeButton"
              borderTopWidth="1px"
              onPress={onConfirm}>
              <Text variant="closeButton" fontWeight="400">
                {confirmText}
              </Text>
            </Button>
          </HStack>
        </VStack>
      </Modal.Content>
    </Modal>
  );
};

export default ConfirmDialog;

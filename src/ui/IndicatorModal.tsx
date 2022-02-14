import {Modal as NBModal, Text} from 'native-base';
import React from 'react';
import {ActivityIndicator} from 'react-native';

const IndicatorModal: React.FC = () => {
  return (
    <NBModal isOpen overlayVisible={true}>
      <NBModal.Content
        bg="rgba(255,255,255,1)"
        w="280px"
        h="120px"
        alignItems="center"
        justifyContent="space-evenly">
        <Text fontSize="md">정보를 불러오고 있습니다</Text>
        <ActivityIndicator size="large" color="#000000" />
      </NBModal.Content>
    </NBModal>
  );
};

export default IndicatorModal;

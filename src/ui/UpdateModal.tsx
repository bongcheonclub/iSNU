import {Modal as NBModal, Text, View} from 'native-base';
import React from 'react';
import {colors} from './colors';

const UpdateModal: React.FC<{percent: number}> = ({
  percent,
}: {
  percent: number;
}) => {
  return (
    <NBModal isOpen overlayVisible={true}>
      <NBModal.Content
        bg="rgba(255,255,255,1)"
        w="280px"
        h="120px"
        alignItems="center"
        justifyContent="space-evenly"
        p="8px"
        px="24px">
        <Text fontSize="md">업데이트 중입니다..</Text>
        <View
          width="100%"
          height="14px"
          mt="8px"
          mb="16px"
          borderRadius="full"
          backgroundColor={colors.grey[200]}>
          <View
            height="14px"
            backgroundColor={colors.blue}
            borderRadius="full"
            width={percent === 0 ? '0%' : `${percent}%`}
          />
        </View>
      </NBModal.Content>
    </NBModal>
  );
};

export default UpdateModal;

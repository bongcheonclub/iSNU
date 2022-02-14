import {Modal as NBModal} from 'native-base';
import React, {useMemo} from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';

const IndicatorModal: React.FC = () => {
  const androidModalStyle: StyleProp<ViewStyle> = useMemo(
    () => ({
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    }),
    [],
  );
  if (Platform.OS === 'android') {
    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={true}
        style={androidModalStyle}>
        <ActivityIndicator size="large" color="#000000" />
      </Modal>
    );
  } else {
    return (
      <NBModal isOpen overlayVisible={false}>
        <NBModal.Content bg="rgba(255,255,255,0)">
          <ActivityIndicator size="large" color="#000000" />
        </NBModal.Content>
      </NBModal>
    );
  }
};

export default IndicatorModal;

import React from 'react';
import {IPressableProps, Pressable} from 'native-base';
import amplitude from '../helpers/amplitude';

type WrappedPressableType = (
  props: IPressableProps & {label: string; tag?: Record<string, unknown>},
) => React.ReactElement;

const WrappedPressable: WrappedPressableType = ({
  label,
  tag,
  onPress,
  ...props
}) => {
  return (
    <Pressable
      onPress={e => {
        amplitude.logEvent(label, tag);
        onPress?.(e);
      }}
      {...props}
    />
  );
};

export default WrappedPressable as WrappedPressableType;

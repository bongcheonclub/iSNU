import React, {useCallback} from 'react';
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
  const wrappedOnPress = useCallback(
    e => {
      amplitude.logEvent(label, tag);
      onPress?.(e);
    },
    [label, onPress, tag],
  );
  return <Pressable onPress={wrappedOnPress} {...props} />;
};

export default WrappedPressable as WrappedPressableType;

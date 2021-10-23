import React, {useCallback} from 'react';
import {Button, IPressableProps, ITextProps} from 'native-base';
import type {ResponsiveValue} from 'native-base/lib/typescript/components/types';
import type {ISizes} from 'native-base/lib/typescript/theme/base/sizes';
import type {IStackProps} from 'native-base/lib/typescript/components/primitives';
import type {MutableRefObject} from 'react-native/node_modules/@types/react';
import amplitude from '../helpers/amplitude';
export interface IButtonProps extends IPressableProps {
  label: string;

  tags?: Record<string, unknown>;
  /**
   * The color of the radio when it's checked. This should be one of the color keys in the theme (e.g."green", "red").
   * @default 'primary'
   */
  colorScheme?: string;
  /**
   * The variant of the button style to use.
   * @default 'solid'
   */
  variant?: ResponsiveValue<string>;
  /**
   * If true, the button will show a spinner.
   */
  isLoading?: boolean;
  /**
   * The size of the button.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  size?: ResponsiveValue<ISizes | (string & {}) | number>;
  /**
   * The start icon element to use in the button.
   */
  startIcon?: React.ReactElement | Array<React.ReactElement>;
  /**
   * The end icon element to use in the button.
   */
  endIcon?: React.ReactElement | Array<React.ReactElement>;
  /**
   * The end icon element to use in the button.
   */
  isLoadingText?: string;
  /**
   * The spinner element to use when isLoading is set to true.
   */
  spinner?: React.ReactElement;
  /**
   * If true, the button will be disabled.
   */
  isDisabled?: boolean;
  /**
   * Props to style the child text
   */
  _text?: ITextProps;
  /**
   * Props to be passed to the HStack used inside of Button.
   */
  _stack?: IStackProps;
  /**
   * Prop to decide placement of spinner.
   */
  spinnerPlacement?: 'start' | 'end';
  /**
   * Props to be passed to the button when isLoading is true.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _loading?: any;
  /**
   * Props to be passed to the button when button is disabled.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _disabled?: any;
  /**
   * Props to be passed to the spinner when isLoading is true.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _spinner?: any;
  /**
   * The right icon element to use in the button.
   */
  rightIcon?: React.ReactElement | Array<React.ReactElement>;
  /**
   * The left icon element to use in the button.
   */
  leftIcon?: React.ReactElement | Array<React.ReactElement>;
}
export interface IButtonGroupProps extends IStackProps {
  /**
   * The direction of the Stack Items.
   * @default row
   */
  direction?: 'column' | 'row';
  /**
   *
   */
  children: React.ReactElement | Array<React.ReactElement>;
  /**
   * The variant of the button style to use.
   * @default 'solid'
   */
  variant?: 'ghost' | 'outline' | 'solid' | 'link' | 'unstyled';
  /**
   * The start icon element to use in the button.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  size?: ResponsiveValue<ISizes | (string & {}) | number>;
  /**
   * The color of the radio when it's checked. This should be one of the color keys in the theme (e.g."green", "red").
   * @default 'primary'
   */
  colorScheme?: string;
  /**
   * If true, the button will be disabled.
   */
  isDisabled?: boolean;
  /**
   * If true, button will be atttached together.
   */
  isAttached?: boolean;
}
export declare type WrappedButtonType = (
  props: IButtonProps & {
    ref?: MutableRefObject<unknown>;
  },
) => React.ReactElement;

const WrappedButton: WrappedButtonType = ({
  label,
  tags: tag,
  onPress,
  variant,
  ...props
}) => {
  const wrappedOnPress = useCallback(
    e => {
      amplitude.logEvent(label, tag);
      onPress?.(e);
    },
    [label, onPress, tag],
  );
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Button variant={variant as any} onPress={wrappedOnPress} {...props} />
  );
};

export default WrappedButton as WrappedButtonType;

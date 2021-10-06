import type React from 'react';
import {Button, IPressableProps, ITextProps} from 'native-base';
import type {ResponsiveValue} from 'native-base/lib/typescript/components/types';
import type {ISizes} from 'native-base/lib/typescript/theme/base/sizes';
import type {IStackProps} from 'native-base/lib/typescript/components/primitives';
import type {MutableRefObject} from 'react-native/node_modules/@types/react';
export interface IButtonProps extends IPressableProps {
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
  _loading?: any;
  /**
   * Props to be passed to the button when button is disabled.
   */
  _disabled?: any;
  /**
   * Props to be passed to the spinner when isLoading is true.
   */
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
export declare type IButtonComponentType = ((
  props: IButtonProps & {
    ref?: MutableRefObject<any>;
  },
) => React.ReactElement) & {
  Group: React.MemoExoticComponent<
    (
      props: IButtonGroupProps & {
        ref?: MutableRefObject<any>;
      },
    ) => React.ReactElement
  >;
};

export default Button as IButtonComponentType;

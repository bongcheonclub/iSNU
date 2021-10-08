import React from 'react';
import {ITextProps, Text} from 'native-base';

type TypeOverridedText = React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    ITextProps & {variant?: string} & React.RefAttributes<unknown>
  >
>;

export default Text as TypeOverridedText;

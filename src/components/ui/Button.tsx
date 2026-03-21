import React from 'react';
import { Button as PaperButton, ButtonProps } from 'react-native-paper';

const Button = (props: ButtonProps) => {
  return <PaperButton mode={props.mode ?? 'contained'} {...props} />;
};

export default Button;


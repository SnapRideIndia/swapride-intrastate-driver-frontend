import React from 'react';
import { Text as PaperText, TextProps } from 'react-native-paper';

const Text = (props: React.ComponentProps<typeof PaperText>) => {
  return <PaperText {...props} />;
};

export default Text;


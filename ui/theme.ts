import {extendTheme} from 'native-base';

export const theme = extendTheme({
  fontConfig: {
    NotoSansKR: {
      100: 'NotoSansKR-Thin',
      200: 'NotoSansKR-Light',
      300: 'NotoSansKR-Regular',
      400: 'NotoSansKR-Medium',
      500: 'NotoSansKR-Bold',
      600: 'NotoSansKR-Black',
    },
  },
  fonts: {
    heading: 'NotoSansKR',
    body: 'NotoSansKR',
    mono: 'NotoSansKR',
  },
});

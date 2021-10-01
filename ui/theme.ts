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

  colors: {
    brown: {
      100: '#E9E7CE', //Favorite Place Background
      200: '#DDD9A5', //Favorite Place Outline
      300: '#A17C2F', //Favorite Place Name
      400: '#8B7A55', //Favorite Menu Price
      500: '#59584E', //Favorite Menu Name
    },
    gray: {
      100: '#F8F8F8', //Normal Place Background
      200: '#EBEBEB', //Closed Favorite Place Background
      300: '#DCDCDC', //Normal Place Outline
      400: '#ABABAB', //Closed Normal Place Name
      500: '#929292', //Sub Info
      600: '#888888', //Favorite Place Time
      700: '#636363', //Normal Place Name
    },
    blue: '#0C146B', //Page Title
  },

  components: {
    Text: {
      baseStyle: {
        fontFamily: 'body',
      },
    },
  },
});

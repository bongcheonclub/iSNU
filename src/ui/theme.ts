import {extendTheme} from 'native-base';

export const theme = extendTheme({
  fontConfig: {
    NotoSansCJKkr: {
      300: 'NotoSansCJKkr-Regular',
      400: 'NotoSansCJKkr-Medium',
      500: 'NotoSansCJKkr-Bold',
    },
  },
  fonts: {
    heading: 'NotoSansCJKkr',
    body: 'NotoSansCJKkr',
    mono: 'NotoSansCJKkr',
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
      300: '#DCDCDC', //Closed Favorite Place, Normal Place Outline
      400: '#ABABAB', //Closed Normal Place Name
      500: '#929292', //Sub Info
      600: '#888888', //Favorite Place Time
      700: '#636363', //Normal Place Name
      800: '#505050', //Sub Content
    },
    blue: {
      // 100: '#4451DE', //Pressed
      100: '#0085FF',
      200: '#0C146B', //Page Title
      300: '#070F64', //Tip Submit Button Border
    },
    white: '#FFFFFF',
    black: '#000000',
  },

  components: {
    Text: {
      baseStyle: {
        fontFamily: 'body',
      },
      variants: {
        pageTitle: {
          color: 'blue.200',
          fontSize: '40px',
          fontWeight: '500',
        },
        favoriteOpenPlaceNameBig: {
          // For Meal, Bus
          color: 'brown.300',
          fontSize: '20px',
          fontWeight: '500',
        },
        favoriteOpenPlaceNameSmall: {
          // For Cafe, Mart
          color: 'brown.300',
          fontSize: '15px',
          fontWeight: '500',
        },
        favoriteClosedPlaceNameBig: {
          // For Meal, Bus
          color: 'brown.300',
          fontSize: '20px',
          fontWeight: '500',
          opacity: '40',
        },
        favoriteClosedPlaceNameSmall: {
          // For Cafe, Mart
          color: 'brown.300',
          fontSize: '15px',
          fontWeight: '500',
          opacity: '40',
        },
        favoritePlaceTime: {
          color: 'gray.600',
          fontSize: '13px',
          fontWeight: '400',
        },
        favoriteMenuName: {
          color: 'brown.500',
          fontSize: '13px',
          fontWeight: '400',
        },
        favoriteMenuPrice: {
          color: 'brown.400',
          fontSize: '13px',
          fontWeight: '400',
        },
        favoriteClosedInfo: {
          color: 'gray.600',
          fontSize: '13px',
          fontWeight: '400',
        },
        normalOpenPlaceBig: {
          // For Bus, Etc
          color: 'gray.700',
          fontSize: '20px',
          fontWeight: '400',
        },
        normalOpenPlaceSmall: {
          // For Else
          color: 'gray.700',
          fontSize: '15px',
          fontWeight: '400',
        },
        normalClosedPlaceBig: {
          // For Bus
          color: 'gray.400',
          fontSize: '20px',
          fontWeight: '400',
        },
        normalClosedPlaceSmall: {
          // For Else
          color: 'gray.400',
          fontSize: '15px',
          fontWeight: '400',
        },
        normalPlaceTime: {
          color: 'gray.600',
          fontSize: '13px',
          fontWeight: '400',
        },
        modalTitle: {
          color: 'blue.200',
          fontSize: '25px',
          fontWeight: '500',
        },
        moreModalTitle: {
          color: 'blue.200',
          fontSize: '20px',
          fontWeight: '500',
        },
        modalToday: {
          color: 'black',
          fontSize: '15px',
          fontWeight: '400',
        },
        modalSubInfo: {
          color: 'gray.500',
          fontSize: '13px',
          fontWeight: '400',
        },
        modalSubContent: {
          color: 'gray.800',
          fontSize: '13px',
          fontWeight: '400',
        },
        modalMenuTime: {
          color: 'gray.500',
          fontSize: '10px',
          fontWeight: '400',
        },
        submitButton: {
          color: 'white',
          fontSize: '15px',
          fontWeight: '400',
        },
        closeButton: {
          color: 'blue.100',
          fontSize: '18px',
        },
        pressedModalTitle: {
          color: 'blue.100',
          fontSize: '20px',
          fontWeight: '500',
        },
      },
    },
    Button: {
      variants: {
        favoritePlace: {
          bg: 'brown.100',
          borderColor: 'brown.200',
          borderWidth: '1px',
          rounded: '10px',
          _pressed: {
            bg: 'brown.200',
          },
        },
        normalPlace: {
          bg: 'gray.100',
          borderColor: 'gray.300',
          borderWidth: '1px',
          rounded: '10px',
          _pressed: {
            bg: 'gray.200',
          },
        },
        submitButton: {
          bg: 'blue.200',
          borderColor: 'blue.300',
          borderWidth: '1px',
          rounded: '10px',
          _pressed: {
            bg: 'blue.100',
            borderColor: 'blue.100',
          },
          _disabled: {
            bg: 'blue.200',
            opacity: '40',
          },
        },
        closeButton: {
          bg: 'transparent',
          borderColor: 'gray.300',
          rounded: '0',
          _pressed: {
            bg: 'gray.200',
          },
        },
        changeMenuDateButton: {
          bg: 'transparent',
          borderColor: 'gray.300',
          rounded: '8',
          _pressed: {
            bg: 'gray.200',
          },
        },
      },
    },
  },
});

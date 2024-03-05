import {floor} from 'lodash';

function refineMenuName(rawText: string) {
  const splitedText = rawText
    .split(/\+|&|\*/)
    .map((item: string) => item.trim());
  const refinedMenuNameArray: string[] = [];
  splitedText.forEach(item => {
    const lastIndex = refinedMenuNameArray.length - 1;
    if (lastIndex === -1) {
      refinedMenuNameArray.push(item);
    } else {
      if (refinedMenuNameArray[lastIndex].length + item.length > 8) {
        refinedMenuNameArray[lastIndex] =
          refinedMenuNameArray[lastIndex] + '\n';
        refinedMenuNameArray.push('+' + item);
      } else if (refinedMenuNameArray[lastIndex].length + item.length <= 8) {
        refinedMenuNameArray[lastIndex] =
          refinedMenuNameArray[lastIndex] + '+' + item;
      }
    }
  });
  return refinedMenuNameArray.join('').trim();
}

const RefineFetchedMenuOf: {
  [key: string]: (
    text: string,
  ) => ({menuName: string; price: string} | null)[] | string;
} = {
  default: function (text: string) {
    return text
      .replace(/.파업/, '※')
      .split(' (')
      .join('(')
      .split(/00원? /) // 작업중
      .map((item: string) => {
        return item
          .trim()
          .split(/ *&amp; */)
          .join('&')
          .split(' ');
      })
      .map((menuAndPrice: string[]) => {
        if (
          menuAndPrice[0].includes('※') ||
          menuAndPrice[0].includes('운영시간')
        ) {
          return null;
        }
        const menuName = refineMenuName(menuAndPrice[0]);
        const price = menuAndPrice[1] + '00원';

        const result = menuName.trim() === '' ? null : {menuName, price};
        return result;
      });
  },
  자하연: function (text: string) {
    return text
      .replace(/.파업/, '※')
      .replace(/\( ?3층/, '※')
      .split('※')[0]
      .split(/00원? /)
      .map((item: string) => {
        return item
          .trim()
          .split(/ *&amp; */)
          .join('&')
          .split(' ');
      })
      .map((menuAndPrice: string[]) => {
        if (menuAndPrice.length !== 2) {
          return null;
        }
        const [menuName, price] = [
          refineMenuName(menuAndPrice[0]),
          menuAndPrice[1] + '00원',
        ];
        const result = menuName.trim() === '' ? null : {menuName, price};
        return result;
      });
  },
  예술계: function (text: string) {
    return text
      .split('▶')[0]
      .split(/00원? /)
      .map((item: string) => {
        return item
          .trim()
          .split(/ *&amp; */)
          .join('&\n')
          .split(/ *: */);
      })
      .map((menuAndPrice: string[]) => {
        if (menuAndPrice.length !== 2) {
          return null;
        }
        const [menuName, price] = [
          refineMenuName(menuAndPrice[0]),
          menuAndPrice[1] + '00원',
        ];
        const result = menuName.trim() === '' ? null : {menuName, price};
        return result;
      });
  },
  '220동': function (text: string) {
    return text
      .split('※')[0]
      .split(/00원? /)
      .map((item: string) => {
        return item
          .trim()
          .split(/ *&amp; */)
          .join('&')
          .replace(/ *[/*|/&|/+] */, '+')
          .split(' ');
      })
      .map((menuAndPrice: string[]) => {
        if (
          menuAndPrice.length !== 2 &&
          !menuAndPrice[0].includes('플러스메뉴')
        ) {
          return null;
        }
        const [menuName, price] = menuAndPrice[0].includes('플러스메뉴')
          ? [
              refineMenuName(menuAndPrice[0] + '\n' + menuAndPrice[1]),
              menuAndPrice[2] + '00원',
            ]
          : [refineMenuName(menuAndPrice[0]), menuAndPrice[1] + '00원'];
        const result = menuName.trim() === '' ? null : {menuName, price};
        return result;
      });
  },
  대학원기숙사: function (text: string) {
    const matchedStrings = text.match(/[A-Z]|\(\d,\d\d\d원\)/gi);
    if (!matchedStrings) {
      return '';
    }
    return matchedStrings
      .map((priceSymbol, priceIndex) => {
        if (priceSymbol.length === 1) {
          const rawPrice = (priceSymbol.charCodeAt(0) - 65) * 500 + 2000;
          const refinedPrice =
            floor(rawPrice / 1000) +
            ',' +
            (rawPrice % 1000 === 0 ? '000' : rawPrice % 1000);
          return {
            parsedString: text.split(/[A-Z]|\(\d,\d\d\d원\)/)[priceIndex + 1],
            price: `${refinedPrice}원`,
          };
        } else {
          return {
            parsedString: text.split(/[A-Z]|\(\d,\d\d\d원\)/)[priceIndex + 1],
            price: `${priceSymbol.slice(1, -2)}원`,
          };
        }
      })
      .map(({parsedString, price}) => {
        const menuName = refineMenuName(parsedString);

        const result = menuName.trim() === '' ? null : {menuName, price};
        return result;
      });
  },
  감골: function (text: string) {
    return text
      .trim()
      .split('※')[0]
      .split('&amp;')
      .join('&')
      .split('&lt;')
      .join('<')
      .split('&gt;')
      .join('>')
      .split(/00원/)
      .join('00원\n\n');
  },
  소담마루: function (text: string) {
    return text;
  },
  두레미담: function (text: string) {
    return text
      .trim()
      .split('※')[0]
      .split('&amp;')
      .join('&')
      .split('&lt;')
      .join('<')
      .split('&gt;')
      .join('>')
      .split(/00원 /)
      .join('00원\n')
      .split(/<주문식 ?메뉴/)[0];
  },
  공간: function (text: string) {
    return text
      .trim()
      .split('※')[0]
      .split(/00원/)
      .join('00원\n')
      .split(/ *&amp; */)
      .join('&\n')
      .split('*')
      .join('\n*')
      .split('&lt;')
      .join('\n<')
      .split(/&gt;/)
      .join('>\n')
      .split(/<단품 메뉴>/)
      .join('\n<단품 메뉴>')
      .split(/<셋트 *메뉴>\n/)
      .join('<셋트메뉴>');
  },
  '301동': function (text: string) {
    return text
      .trim()
      .split('▷')
      .join('\n▷')
      .split('★')[0]
      .split(/00원/)
      .join('00원\n')
      .split(/ *&amp; */)
      .join('&')
      .split('&lt;')
      .join('<')
      .split('&gt;')
      .join('>\n')
      .split('*')[0];
  },
  '302동': function (text: string) {
    return text
      .trim()
      .split('&lt;')
      .join('<')
      .split('&gt;')
      .join('>')
      .split(/ *&amp; */)
      .join('&')
      .split(/00원/)
      .join('00원\n')
      .split('※')
      .join('\n※');
  },
};

export function refineMenuRawText(mealName: string, text: string) {
  // const passList = ["라운지오"]
  const notDefaultList = [
    // '자하연',
    '예술계',
    '소담마루',
    '두레미담',
    '공간',
    '301동',
    '302동',
    '220동',
    '대학원기숙사',
    '감골',
  ];

  if (
    text.includes('휴관') ||
    text.includes('휴점') ||
    text.includes('폐점') ||
    text.includes('미운영')
  ) {
    return '휴무/휴점';
  }

  text = text.split('&nbsp;').join(' ');

  const indexOfNotDefaultList = notDefaultList.indexOf(mealName);
  if (indexOfNotDefaultList > -1) {
    return RefineFetchedMenuOf[notDefaultList[indexOfNotDefaultList]](text);
  } else {
    return RefineFetchedMenuOf.default(text);
  }
}

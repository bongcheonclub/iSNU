import {chain} from 'lodash';
import {parse} from 'node-html-parser';
import {AxiosResponse} from 'axios';
import {isVacation, processVacationCafe} from './ProcessVacation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function processMartData(res: AxiosResponse<any>) {
  const html = res.data;
  const root = parse(html);
  const marts = chain(Array.from(root.querySelector('thead').childNodes))
    .map(trNode => {
      const trTexts = chain(trNode.childNodes)
        .map(tdNode =>
          tdNode.innerText
            .split(/\s|\t|\n/)
            .filter(item => item.length > 0)
            .join(' '),
        )
        .filter(rows => rows.length > 0)
        .value();
      const [name, location, items, weekday, saturday, holiday, contact] =
        trTexts;
      return {
        name,
        location,
        items,
        weekday,
        saturday,
        holiday,
        contact,
      };
    })
    .slice(2)
    .value();

  const defaultMarts = [
    {
      name: '해동 학술관',
      location: '공과대학 해동학술관 (32-1동 지하1층)',
      items: '',
      weekday: '08:00~23:00',
      saturday: '08:00~23:00',
      holiday: '08:00~23:00',
      contact: '',
    },
    {
      name: '34동',
      location: '공과대학 (34동 1층)',
      items: '',
      weekday: '24시간',
      saturday: '24시간',
      holiday: '24시간',
      contact: '',
    },
    {
      name: '사회대',
      location: '사회과학대학 신양학술정보관 (16-1동 1층)',
      items: '',
      weekday: '24시간',
      saturday: '24시간',
      holiday: '24시간',
      contact: '',
    },
    {
      name: '기숙사GS25',
      location: '대학원 기숙사 (901동 1층)',
      items: '',
      weekday: '24시간',
      saturday: '24시간',
      holiday: '24시간',
      contact: '',
    },
  ];

  const allMarts = marts.concat(defaultMarts);

  /**
   * Refine mart data.
   */

  function refineName(name: string): string {
    const trimmedName = name.trim();
    const replacedName = (() => {
      switch (trimmedName) {
        case '스누플렉스 (복합매장)':
          return '스누 플렉스';
        case '글로벌생활관 편의점':
          return '글로벌 생활관';
        case '기숙사GS25':
          return '기숙사 GS25';
        default:
          return trimmedName;
      }
    })();
    return replacedName.replace('편의점', '').trim();
  }

  function refineTime(time: string): string {
    return time.replace('24시간 유', '24시간\n유');
  }

  const refinedMarts = chain(allMarts)
    .map(mart => ({
      ...mart,
      name: refineName(mart.name),
      weekday: refineTime(mart.weekday),
      saturday: refineTime(mart.saturday),
      holiday: refineTime(mart.holiday),
    }))
    .value();
  return refinedMarts;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function processCafeData(res: AxiosResponse<any>) {
  const html = res.data;
  const root = parse(html);
  const cafes = chain(Array.from(root.querySelector('thead').childNodes))
    .map(trNode => {
      const trTexts = chain(trNode.childNodes)
        .map(tdNode =>
          tdNode.innerText
            .split(/\s|\t|\n/)
            .filter(item => item.length > 0)
            .join(' '),
        )
        .filter(rows => rows.length > 0)
        .slice(2)
        .value();
      const [
        nameWithContact,
        location,
        size,
        items,
        weekday,
        saturday,
        holiday,
      ] = trTexts;
      const [name, contact] = nameWithContact.split(/\(|\)/);
      return {
        name,
        contact,
        location,
        size,
        items,
        weekday,
        saturday,
        holiday,
      };
    })
    .value();

  const defaultCafes = [
    {
      name: '카페그랑',
      location: '901동 1층',
      items: '',
      size: '',
      weekday: '07:30~22:00',
      saturday: '07:30~21:00',
      holiday: '07:30~21:00',
      contact: '02-881-9204',
    },
    {
      name: '사범대 더랩',
      location: '기초사범교육협력센터 1층(12동)',
      items: '',
      size: '',
      weekday: '08:00~20:00',
      saturday: '09:00~17:00',
      holiday: '휴무',
      contact: '02-878-8880',
    },
    {
      name: '커피앤티',
      location: '사회대 신양학술정보관 (16-1동)',
      items: '',
      size: '',
      weekday: '08:00~18:00',
      saturday: '휴무',
      holiday: '휴무',
      contact: '02-871-2558',
    },
    {
      name: '더로스터 59',
      location: 'LG경영관 2층(59동)',
      items: '',
      size: '',
      weekday: '08:00~20:00',
      saturday: '08:00~17:00',
      holiday: '휴무',
      contact: '02-873-8880',
    },
  ];

  function refineName(name: string): string {
    const trimmedName = name.trim().replace('느티나무', '느티나무 ');
    const replacedName = (() => {
      switch (trimmedName) {
        case 'Pascucci':
          return '파스쿠찌';
        case '투썸플레이스':
          return '투썸 플레이스';
        case '카페이야기':
          return '카페 이야기';
        case '라운지스낵':
          return '라운지 스낵';
        case '수의대스낵':
          return '수의대 스낵';
        default:
          return trimmedName;
      }
    })();
    return replacedName.trim();
  }

  const allCafes = cafes
    .concat(defaultCafes)
    .filter(cafe => cafe.weekday && cafe.saturday && cafe.holiday);

  const refinedCafes = chain(allCafes)
    .map(cafe => ({
      ...cafe,
      name: refineName(cafe.name),
    }))
    .value();

  if (isVacation() !== false) {
    return refinedCafes.map(eachCafe => processVacationCafe(eachCafe));
  }

  console.log(
    refinedCafes.map(eachCafe => ({
      name: eachCafe.name,
      weekday: eachCafe.weekday,
      saturday: eachCafe.saturday,
      holiday: eachCafe.holiday,
    })),
  );

  return refinedCafes;
}

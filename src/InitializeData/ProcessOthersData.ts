import {chain} from 'lodash';
import {parse} from 'node-html-parser';
import {AxiosResponse} from 'axios';

export function processMartData(res: AxiosResponse<any>) {
  const html = res.data;
  const root = parse(html);
  const marts = chain(root.querySelector('tbody').childNodes)
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
    .value();

  const defaultMart = [
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
  return marts.concat(defaultMart);
}

export function processCafeData(res: AxiosResponse<any>) {
  const html = res.data;
  const root = parse(html);
  const cafes = chain(root.querySelector('tbody').childNodes)
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
  const defaultCafe = [
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
  return cafes.concat(defaultCafe);
}

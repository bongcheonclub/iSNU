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
  return marts;
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

  return cafes;
}

import {FAVORITE_STORAGE_KEY} from '../constants';
import axios from 'axios';
import {chain, map} from 'lodash';
import {parse} from 'node-html-parser';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function initializeData() {
  const [
    [res, martRes],
    [favoriteCafeList, favoriteMartList, favoriteShuttleList],
  ] = await Promise.all([
    Promise.all([
      axios.get('https://snuco.snu.ac.kr/ko/node/21'),
      axios.get('https://snuco.snu.ac.kr/ko/node/19'),
    ]),
    Promise.all(map(FAVORITE_STORAGE_KEY, key => AsyncStorage.getItem(key))),
  ]);

  const initialFavoriteCafes = favoriteCafeList
    ? JSON.parse(favoriteCafeList)
    : [];

  const initialFavoriteMarts = favoriteMartList
    ? JSON.parse(favoriteMartList)
    : [];

  const initialFavoriteShuttles = favoriteShuttleList
    ? JSON.parse(favoriteShuttleList)
    : [];
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
  const martHtml = martRes.data;
  const martRoot = parse(martHtml);
  const marts = chain(martRoot.querySelector('tbody').childNodes)
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

  return {
    cafes,
    marts,
    initialFavoriteCafes,
    initialFavoriteMarts,
    initialFavoriteShuttles,
  };
}

export const convertToKoreanDay = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
  if (day === 0) {
    return '일';
  }
  if (day === 1) {
    return '월';
  }
  if (day === 2) {
    return '화';
  }
  if (day === 3) {
    return '수';
  }
  if (day === 4) {
    return '목';
  }
  if (day === 5) {
    return '금';
  }
  if (day === 6) {
    return '토';
  }
  throw Error('이럴리없다.');
};

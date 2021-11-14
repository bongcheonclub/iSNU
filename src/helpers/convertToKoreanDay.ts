export const convertToKoreanDay = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
  if (day === 0) {
    return '일';
  } else if (day === 1) {
    return '월';
  } else if (day === 2) {
    return '화';
  } else if (day === 3) {
    return '수';
  } else if (day === 4) {
    return '목';
  } else if (day === 5) {
    return '금';
  } else {
    // day === 6
    return '토';
  }
};

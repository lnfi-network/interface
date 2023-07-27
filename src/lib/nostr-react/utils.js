export const uniqBy = (arr, key) => {
  return Object.values(
    arr.reduce(
      (map, item) => ({
        ...map,
        [`${item[key]}`]: item
      }),
      {}
    )
  );
};

export const uniqValues = (value, index, self) => {
  return self.indexOf(value) === index;
};

export const dateToUnix = (_date) => {
  const date = _date || new Date();

  return Math.floor(date.getTime() / 1000);
};

export const restoreVar = (key, initial) => {
  let obj = initial;
  try {
    obj = JSON.parse(window.localStorage.getItem(key));
    if (!obj) obj = initial;
  } catch (e) {}
  return obj;
};

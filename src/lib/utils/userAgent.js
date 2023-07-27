const userAgent = navigator.userAgent;
const reChrome = /chrome/i;
const reSafari = /safari/i;
const reTokenpocket = /tokenpocket/i;
const reMetamask = /metamask/i;
export const isInChrome = reChrome.test(userAgent);
export const isInSafari = reSafari.test(userAgent);
export const isInMetamask = reMetamask.test(userAgent);
export const isInTokenPocket = () => {
  return reTokenpocket.test(userAgent) || window.ethereum?.isTokenPocket;
};
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
};

export const isApple = () => {
  return /iPhone|iPad|iPod/i.test(userAgent);
};

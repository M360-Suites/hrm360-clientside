import Cookies from "js-cookie";

const isProduction = window.location.protocol === "https:";

const COOKIE_OPTIONS = {
  expires: 7,
  secure: isProduction,
  sameSite: "strict" as const,
};

export const setCookie = (key: string, value: string) => {
  Cookies.set(key, value, COOKIE_OPTIONS);
};

export const getCookie = (key: string) => {
  return Cookies.get(key) || null;
};

export const removeCookie = (key: string) => {
  Cookies.remove(key);
};
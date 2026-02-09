
import fetchJsonp from "fetch-jsonp";

const OTHER_WEATHER_API =
  import.meta.env.VITE_WEATHER_OTHER_API || "https://api.oioweb.cn/api/weather/GetWeather";

/**
 * 音乐播放器
 */

// 获取音乐播放列表
export const getPlayerList = async (server, type, id) => {
  const res = await fetch(
    `${import.meta.env.VITE_SONG_API}?server=${server}&type=${type}&id=${id}`,
  );
  const data = await res.json();

  if (data[0].url.startsWith("@")) {
    // eslint-disable-next-line no-unused-vars
    const [handle, jsonpCallback, jsonpCallbackFunction, url] = data[0].url.split("@").slice(1);
    const jsonpData = await fetchJsonp(url).then((res) => res.json());
    const domain = (
      jsonpData.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
      jsonpData.req_0.data.sip[0]
    ).replace("http://", "https://");

    return data.map((v, i) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: domain + jsonpData.req_0.data.midurlinfo[i].purl,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  } else {
    return data.map((v) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: v.url,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  }
};

/**
 * 天气
 */

// 获取用户 IP
const getUserIP = async () => {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip;
  } catch (error) {
    console.error("获取 IP 失败:", error);
    return null;
  }
};

// 获取高德地理位置信息
export const getAdcode = async (key) => {
  const ip = await getUserIP();
  const url = ip
    ? `/api/amap/v3/ip?key=${key}&ip=${ip}`
    : `/api/amap/v3/ip?key=${key}`;
  const res = await fetch(url);
  return await res.json();
};

// 获取高德地理天气信息
export const getWeather = async (key, city) => {
  const res = await fetch(
    `/api/amap/v3/weather/weatherInfo?key=${key}&city=${city}`,
  );
  return await res.json();
};

// 获取腾讯地理位置信息
export const getTXAdcode = async (key) => {
  const res = await fetch(`/api/qqmap/ws/location/v1/ip?key=${key}&output=json`);
  return await res.json();
};

// 获取腾讯地理天气信息
export const getTXWeather = async (key, city) => {
  const res = await fetch(
    `/api/qqmap/wisdom/weather/current?key=${key}&city=${city}`,
  );
  return await res.json();
};

// 获取 FreeIPAPI (无 Key IP 定位)
export const getFreeIp = async () => {
  const res = await fetch("/api/freeip/api/json");
  return await res.json();
};

// 获取 OpenMeteo 天气 (无 Key)
export const getOpenMeteo = async (lat, lon) => {
  const res = await fetch(`/api/openmeteo/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`);
  return await res.json();
};

// 获取教书先生天气 API
// https://api.oioweb.cn/doc/weather/GetWeather
export const getOtherWeather = async () => {
  const res = await fetch(OTHER_WEATHER_API);
  return await res.json();
};

// 获取 7Timer 天气 (完全免费，无需 Key)
// https://www.7timer.info/doc.php
export const get7TimerWeather = async (lat, lon) => {
  const res = await fetch(`/api/7timer/bin/api.pl?lon=${lon}&lat=${lat}&product=civil&output=json`);
  return await res.json();
};

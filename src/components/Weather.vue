<template>
  <div class="weather" v-if="weatherData.adCode.city && weatherData.weather.weather">
    <span>{{ weatherData.adCode.city }}&nbsp;</span>
    <span>{{ weatherData.weather.weather }}&nbsp;</span>
    <span>{{ weatherData.weather.temperature }}℃</span>
    <span class="sm-hidden">
      &nbsp;{{
        weatherData.weather.winddirection?.endsWith("风")
          ? weatherData.weather.winddirection
          : weatherData.weather.winddirection + "风"
      }}&nbsp;
    </span>
    <span class="sm-hidden">{{ weatherData.weather.windpower?.endsWith("级")
      ? weatherData.weather.windpower
      : weatherData.weather.windpower + "级" }}&nbsp;</span>
  </div>
  <div class="weather" v-else>
    <span>天气数据获取失败</span>
  </div>
</template>

<script setup>
import { getAdcode, getWeather, getOtherWeather, getTXAdcode, getTXWeather, getFreeIp, getOpenMeteo } from "@/api";
import { Error } from "@icon-park/vue-next";

// 高德开发者 Key
const mainKey = import.meta.env.VITE_WEATHER_KEY;
// 指定城市/地区（可填城市名或 adcode），用于跳过 IP 定位
const mainCity = import.meta.env.VITE_WEATHER_CITY;
// 腾讯天气 Key
const txKey = import.meta.env.VITE_TX_WEATHER_KEY;

// 天气数据
const weatherData = reactive({
  adCode: {
    city: null, // 城市
    adcode: null, // 城市编码
  },
  weather: {
    weather: null, // 天气现象
    temperature: null, // 实时气温
    winddirection: null, // 风向描述
    windpower: null, // 风力级别
  },
});

// OpenMeteo WMO Code Mapping
const weatherMap = {
  0: "晴",
  1: "多云", 2: "多云", 3: "阴",
  45: "雾", 48: "雾",
  51: "毛毛雨", 53: "毛毛雨", 55: "毛毛雨",
  56: "冻雨", 57: "冻雨",
  61: "小雨", 63: "中雨", 65: "大雨",
  66: "冻雨", 67: "冻雨",
  71: "小雪", 73: "中雪", 75: "大雪",
  77: "雪粒",
  80: "阵雨", 81: "阵雨", 82: "阵雨",
  85: "阵雪", 86: "阵雪",
  95: "雷雨", 96: "雷雨", 99: "雷雨"
};

const getWindDirection = (deg) => {
    if (deg === undefined || deg === null) return "未知";
    const directions = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
    const index = Math.round(deg / 45) % 8;
    return directions[index] + "风";
}

// 取出天气平均值
const getTemperature = (min, max) => {
  try {
    const cleanMin = parseFloat(min.toString().replace(/[^\d.-]/g, ""));
    const cleanMax = parseFloat(max.toString().replace(/[^\d.-]/g, ""));
    if (isNaN(cleanMin) || isNaN(cleanMax)) {
      throw new Error("无法解析温度数据");
    }
    const average = (cleanMin + cleanMax) / 2;
    return Math.round(average);
  } catch (error) {
    console.error("计算温度出现错误：", error);
    return "NaN";
  }
};

// 使用腾讯天气接口
const useTXWeather = async () => {
  console.log("正在使用腾讯天气接口 (通过 Proxy)");
  
  const adRes = await getTXAdcode(txKey);
  console.log("腾讯定位结果:", adRes);
  
  if (adRes?.status !== 0) {
    throw "腾讯定位失败: " + adRes?.message;
  }
  
  const adInfo = adRes.result.ad_info;
  const city = adInfo.city || adInfo.province || "未知地区";
  
  weatherData.adCode = { city, adcode: adInfo.adcode };
  
  // 优先用 mainCity 如果有
  const targetCity = mainCity || city;
  
  const wRes = await getTXWeather(txKey, targetCity);
  console.log("腾讯天气结果:", wRes);
  
  if (wRes?.status !== 0 && wRes?.ret !== 0) {
      throw "腾讯天气获取失败: " + (wRes?.message || JSON.stringify(wRes));
  }
  
  const data = wRes?.data || wRes?.result;
  const observe = data?.observe || data?.realtime;
  
  if (!observe) throw "腾讯天气数据解析失败";
  
  weatherData.weather = {
    weather: observe.weather || observe.weather_short,
    temperature: observe.degree || observe.temp,
    winddirection: observe.wind_direction,
    windpower: observe.wind_power,
  };
};


// 使用高德天气接口
const useGDWeather = async () => {
  console.log("正在使用高德天气接口 (通过 Proxy)");
  const normalizeValue = (value) => (Array.isArray(value) ? value[0] : value);
  
  if (mainCity) {
    console.log("Weather: Using mainCity:", mainCity);
    const result = await getWeather(mainKey, mainCity);
    if (String(result?.status) !== "1" || !result?.lives?.length) {
      throw "高德天气获取失败: " + JSON.stringify(result);
    }
    weatherData.adCode = {
      city: result.lives[0].city || "未知地区",
      adcode: result.lives[0].adcode || mainCity,
    };
    weatherData.weather = {
      weather: result.lives[0].weather,
      temperature: result.lives[0].temperature,
      winddirection: result.lives[0].winddirection,
      windpower: result.lives[0].windpower,
    };
    return;
  }
  
  // 否则尝试 IP 定位
  console.log("使用高德 IP 定位...");
  const adCode = await getAdcode(mainKey);
  console.log("IP 定位结果:", adCode);
  
  const city = normalizeValue(adCode.city);
  const adcode = normalizeValue(adCode.adcode);
  if (String(adCode?.status) !== "1" || !adcode) {
     throw "高德 IP 定位失败: " + JSON.stringify(adCode);
  }
  
  weatherData.adCode = { city: city || adCode.province, adcode };
  
  // 获取天气
  const result = await getWeather(mainKey, adcode);
  console.log("天气查询结果:", result);
  
  if (String(result?.status) !== "1" || !result?.lives?.length) {
    throw "高德天气获取失败: " + JSON.stringify(result);
  }
  weatherData.weather = {
    weather: result.lives[0].weather,
    temperature: result.lives[0].temperature,
    winddirection: result.lives[0].winddirection,
    windpower: result.lives[0].windpower,
  };
};

// 使用 OpenMeteo (完全免费)
const useOpenMeteo = async () => {
  console.log("正在使用 OpenMeteo (Free)");
  // 1. 获取 Lat/Lon
  const ipData = await getFreeIp();
  console.log("FreeIPAPI result:", ipData);
  
  if (!ipData || !ipData.latitude) {
      throw "OpenMeteo: 无法获取位置";
  }
  
  weatherData.adCode = {
      city: ipData.cityName || ipData.regionName || "未知地区",
      adcode: ipData.zipCode,
  };
  
  // 2. 获取天气
  const wData = await getOpenMeteo(ipData.latitude, ipData.longitude);
  console.log("OpenMeteo result:", wData);
  
  if (!wData || !wData.current) {
      throw "OpenMeteo: 天气数据获取失败";
  }
  
  const current = wData.current;
  const wCode = current.weather_code;
  const wText = weatherMap[wCode] || "未知";
  
  weatherData.weather = {
      weather: wText,
      temperature: Math.round(current.temperature_2m),
      winddirection: getWindDirection(current.wind_direction_10m),
      windpower: Math.round(current.wind_speed_10m) + "km/h", // OpenMeteo returns speed, not power level
  };
}

// 获取天气数据 (多层级回退策略)
const getWeatherData = async () => {
  console.log("getWeatherData called. txKey:", txKey ? "Present" : "Missing", "mainKey:", mainKey, "mainCity:", mainCity);
  try {
    
    // 1. 优先尝试腾讯 (如果有 Key) - 腾讯IP定位通常更准
    if (txKey) {
       try {
        await useTXWeather();
        return;
       } catch (error) {
         console.error("腾讯天气接口获取失败，尝试其他接口:", error);
       }
    }
    
    // 2. 尝试高德 (如果有 Key)
    if (mainKey) {
       try {
        await useGDWeather();
        return;
       } catch (error) {
         console.error("高德天气接口获取失败，尝试备用接口:", error);
       }
    }
    
    // 3. 尝试 OpenMeteo (完全免费，基于 FreeIPAPI)
    console.log("Attempting Fallback: OpenMeteo");
    try {
        await useOpenMeteo();
        console.log("OpenMeteo success");
        return;
    } catch(error) {
        console.error("OpenMeteo 失败:", error);
    }
    
    // 所有接口都失败
    throw "所有天气接口均失败，请检查网络或 API Key 配置";
  } catch (error) {
    console.error("天气信息获取失败:", error);
    onError("天气信息获取失败: " + error);
  }
};

// 报错信息
const onError = (message) => {
  ElMessage({
    message,
    icon: h(Error, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
  console.error(message);
};

onMounted(() => {
  // 调用获取天气
  getWeatherData();
});
</script>

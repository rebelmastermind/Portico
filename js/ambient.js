(() => {
  const ns = (window.portico = window.portico || {});
  const { dom } = ns;
  const GEO_TIMEOUT_MS = 20000;
  const GEO_MAX_AGE_MS = 6 * 60 * 60 * 1000;
  const GEO_TIMEOUT_COOLDOWN_MS = 30 * 60 * 1000;
  const GEO_TIMEOUT_UNTIL_KEY = "ambient_geo_timeout_until";
  const LAST_GEO_COORDS_KEY = "ambient_last_geo_coords";
  const DEBUG_WEATHER = false;
  const debug = (message, type = "info") => {
    if (!DEBUG_WEATHER) return;
    ns.notify(`[Ambient] ${message}`, type);
  };

  const WEATHER_KIND = {
    CLEAR: "clear",
    PARTLY: "partly",
    CLOUDY: "cloudy",
    FOG: "fog",
    DRIZZLE: "drizzle",
    RAIN: "rain",
    SNOW: "snow",
    STORM: "storm",
  };

  const iconSvgByKind = {
    clear: "<svg viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2\"/><path d=\"M12 20v2\"/><path d=\"M4.9 4.9l1.4 1.4\"/><path d=\"M17.7 17.7l1.4 1.4\"/><path d=\"M2 12h2\"/><path d=\"M20 12h2\"/><path d=\"M4.9 19.1l1.4-1.4\"/><path d=\"M17.7 6.3l1.4-1.4\"/></svg>",
    partly: "<svg viewBox=\"0 0 24 24\"><path d=\"M8 17h9a4 4 0 1 0-.6-7.96A5 5 0 0 0 7 10.5\"/><path d=\"M8 17a3 3 0 1 1 0-6\"/></svg>",
    cloudy: "<svg viewBox=\"0 0 24 24\"><path d=\"M7 18h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.8A3.6 3.6 0 0 0 7 18Z\"/></svg>",
    fog: "<svg viewBox=\"0 0 24 24\"><path d=\"M4 10h16\"/><path d=\"M3 14h18\"/><path d=\"M5 18h14\"/></svg>",
    drizzle: "<svg viewBox=\"0 0 24 24\"><path d=\"M7 14h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.8A3.6 3.6 0 0 0 7 14Z\"/><path d=\"M9 17v1\"/><path d=\"M13 17v1\"/><path d=\"M17 17v1\"/></svg>",
    rain: "<svg viewBox=\"0 0 24 24\"><path d=\"M7 13h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.8A3.6 3.6 0 0 0 7 13Z\"/><path d=\"M9 16l-1 3\"/><path d=\"M13 16l-1 3\"/><path d=\"M17 16l-1 3\"/></svg>",
    snow: "<svg viewBox=\"0 0 24 24\"><path d=\"M7 12h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.8A3.6 3.6 0 0 0 7 12Z\"/><path d=\"M9 16h0\"/><path d=\"M13 17h0\"/><path d=\"M17 16h0\"/></svg>",
    storm: "<svg viewBox=\"0 0 24 24\"><path d=\"M7 12h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.8A3.6 3.6 0 0 0 7 12Z\"/><path d=\"M12 13l-2 4h3l-1 4 4-6h-3l1-2\"/></svg>",
  };

  const weatherLabel = {
    clear: "Clear",
    partly: "Partly cloudy",
    cloudy: "Cloudy",
    fog: "Fog",
    drizzle: "Drizzle",
    rain: "Rain",
    snow: "Snow",
    storm: "Storm",
  };

  const classifyWeather = (code) => {
    if (code === 0) return WEATHER_KIND.CLEAR;
    if (code === 1 || code === 2) return WEATHER_KIND.PARTLY;
    if (code === 3) return WEATHER_KIND.CLOUDY;
    if (code === 45 || code === 48) return WEATHER_KIND.FOG;
    if ([51, 53, 55, 56, 57].includes(code)) return WEATHER_KIND.DRIZZLE;
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return WEATHER_KIND.RAIN;
    if ([71, 73, 75, 77, 85, 86].includes(code)) return WEATHER_KIND.SNOW;
    if ([95, 96, 99].includes(code)) return WEATHER_KIND.STORM;
    return WEATHER_KIND.CLOUDY;
  };

  const cityFromTimezone = () => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const name = zone.includes("/") ? zone.split("/").pop() : zone;
    return name ? name.replace(/_/g, " ") : "Unknown location";
  };

  const formatCoords = (lat, lon) => `${lat.toFixed(3)}, ${lon.toFixed(3)}`;

  const saveLastCoords = (lat, lon) => {
    try {
      localStorage.setItem(
        LAST_GEO_COORDS_KEY,
        JSON.stringify({ lat, lon, ts: Date.now() })
      );
    } catch {
      // ignore storage failures for non-critical cached coordinates
    }
  };

  const getLastCoords = () => {
    try {
      const raw = localStorage.getItem(LAST_GEO_COORDS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        !parsed ||
        typeof parsed !== "object" ||
        typeof parsed.lat !== "number" ||
        typeof parsed.lon !== "number"
      ) {
        return null;
      }
      return { lat: parsed.lat, lon: parsed.lon };
    } catch {
      return null;
    }
  };

  const formatClock = () => {
    const clockFormat = String(ns.state?.settings?.clockFormat || "24h").toLowerCase();
    return new Intl.DateTimeFormat([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: clockFormat === "12h",
    }).format(new Date());
  };

  const updateClock = () => {
    dom.ambientClock.textContent = formatClock();
  };

  const renderWeather = (tempC, code) => {
    const kind = classifyWeather(code);
    const unit = String(ns.state?.settings?.tempUnit || "C").toUpperCase() === "F" ? "F" : "C";
    const displayTemp = unit === "F" ? ((tempC * 9) / 5) + 32 : tempC;
    dom.ambientWeatherIcon.innerHTML = iconSvgByKind[kind] || iconSvgByKind.cloudy;
    dom.ambientWeatherText.textContent = `${weatherLabel[kind]} ${Math.round(displayTemp)}${unit}`;
  };

  const extractCurrentWeather = (payload) => {
    const fromCurrent = payload?.current;
    const fromLegacy = payload?.current_weather;

    const temp =
      typeof fromCurrent?.temperature_2m === "number"
        ? fromCurrent.temperature_2m
        : typeof fromLegacy?.temperature === "number"
          ? fromLegacy.temperature
          : null;
    const code =
      typeof fromCurrent?.weather_code === "number"
        ? fromCurrent.weather_code
        : typeof fromLegacy?.weathercode === "number"
          ? fromLegacy.weathercode
          : null;

    if (temp === null || code === null) return null;
    return { temp, code };
  };

  const fetchWeatherPayload = async (lat, lon) => {
    const endpoints = [
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`,
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
    ];

    for (const url of endpoints) {
      try {
        debug(`Trying weather endpoint: ${url}`);
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          debug(`Endpoint failed with status ${res.status}`, "error");
          continue;
        }
        const data = await res.json();
        const parsed = extractCurrentWeather(data);
        if (parsed) {
          debug("Weather payload parsed successfully");
          return parsed;
        }
        debug("Endpoint returned payload without usable weather fields", "error");
      } catch (error) {
        debug(`Endpoint request failed: ${error?.message || "unknown error"}`, "error");
      }
    }

    throw new Error("weather payload unavailable");
  };

  const resolveLocationNameFromCoords = async (lat, lon) => {
    const openMeteoUrl =
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=en`;
    try {
      const locationRes = await fetch(openMeteoUrl, { cache: "no-store" });
      const locationData = locationRes.ok ? await locationRes.json() : null;
      const result = Array.isArray(locationData?.results) ? locationData.results[0] : null;
      if (result?.name) {
        return `${result.name}${result.country_code ? `, ${result.country_code}` : ""}`;
      }
      debug("Open-Meteo reverse geocode returned no result");
    } catch (error) {
      debug(`Open-Meteo reverse geocode failed: ${error?.message || "unknown error"}`, "error");
    }

    const bigDataCloudUrl =
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    try {
      const response = await fetch(bigDataCloudUrl, { cache: "no-store" });
      const data = response.ok ? await response.json() : null;
      const city = data?.city || data?.locality || data?.principalSubdivision;
      const country = data?.countryCode || data?.countryName;
      if (city) return `${city}${country ? `, ${country}` : ""}`;
      debug("BigDataCloud reverse geocode returned no city/locality");
    } catch (error) {
      debug(`BigDataCloud reverse geocode failed: ${error?.message || "unknown error"}`, "error");
    }

    return formatCoords(lat, lon);
  };

  const updateFromCoords = async (lat, lon) => {
    debug(`Using coordinates lat=${lat.toFixed(3)} lon=${lon.toFixed(3)}`);

    const weather = await fetchWeatherPayload(lat, lon);
    const locationName = await resolveLocationNameFromCoords(lat, lon);

    dom.ambientLocation.textContent = locationName;
    debug(`Resolved location: ${locationName}`);

    renderWeather(weather.temp, weather.code);
    lastWeather = { temp: weather.temp, code: weather.code };
    debug("Weather rendered");
  };

  const updateFromCity = async (cityName) => {
    debug(`Falling back to city lookup: ${cityName}`);
    const searchUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    const searchRes = await fetch(searchUrl, { cache: "no-store" });
    if (!searchRes.ok) throw new Error("city geocoding failed");
    const searchData = await searchRes.json();
    const result = Array.isArray(searchData?.results) ? searchData.results[0] : null;
    if (!result || typeof result.latitude !== "number" || typeof result.longitude !== "number") {
      throw new Error("city geocoding returned no results");
    }

    dom.ambientLocation.textContent = result.name
      ? `${result.name}${result.country_code ? `, ${result.country_code}` : ""}`
      : cityFromTimezone();

    await updateFromCoords(result.latitude, result.longitude);
  };

  const runCityFallback = async () => {
    const cachedCoords = getLastCoords();
    if (cachedCoords) {
      try {
        debug("Trying fallback with cached coordinates");
        await updateFromCoords(cachedCoords.lat, cachedCoords.lon);
        return;
      } catch (error) {
        debug(`Cached coordinate fallback failed: ${error?.message || "unknown error"}`, "error");
      }
    }

    try {
      const fallbackCity = cityFromTimezone();
      await updateFromCity(fallbackCity);
    } catch (error) {
      debug(`City fallback failed: ${error?.message || "unknown error"}`, "error");
      dom.ambientLocation.textContent = cityFromTimezone();
      dom.ambientWeatherText.textContent = "Weather unavailable";
    }
  };

  const getTimeoutCooldownUntil = () => {
    const raw = localStorage.getItem(GEO_TIMEOUT_UNTIL_KEY);
    const value = Number(raw);
    return Number.isFinite(value) ? value : 0;
  };

  const setTimeoutCooldown = () => {
    const until = Date.now() + GEO_TIMEOUT_COOLDOWN_MS;
    localStorage.setItem(GEO_TIMEOUT_UNTIL_KEY, String(until));
  };

  ns.ambientWidget = {
    refreshPresentation() {
      updateClock();
      if (lastWeather) {
        renderWeather(lastWeather.temp, lastWeather.code);
      }
    },

    async init() {
      if (!dom.ambientWidget) return;

      updateClock();
      setInterval(updateClock, 1000);

      if (!navigator.geolocation) {
        debug("Geolocation API not available", "error");
        dom.ambientLocation.textContent = cityFromTimezone();
        dom.ambientWeatherText.textContent = "Weather unavailable";
        return;
      }

      const timeoutUntil = getTimeoutCooldownUntil();
      if (Date.now() < timeoutUntil) {
        debug("Skipping geolocation due to recent timeout cooldown");
        await runCityFallback();
        return;
      }

      if (navigator.permissions?.query) {
        try {
          const status = await navigator.permissions.query({ name: "geolocation" });
          debug(`Geolocation permission state: ${status.state}`);
        } catch (error) {
          debug(`Permission query failed: ${error?.message || "unknown error"}`, "error");
        }
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          debug("Geolocation success callback");
          try {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            saveLastCoords(lat, lon);
            await updateFromCoords(lat, lon);
          } catch (error) {
            debug(`Coordinate weather flow failed: ${error?.message || "unknown error"}`, "error");
            await runCityFallback();
          }
        },
        async (error) => {
          debug(`Geolocation error callback: code=${error?.code} message=${error?.message || "unknown"}`, "error");
          if (error?.code === 3) {
            setTimeoutCooldown();
            debug("Applied geolocation timeout cooldown", "error");
          }
          await runCityFallback();
        },
        {
          enableHighAccuracy: false,
          timeout: GEO_TIMEOUT_MS,
          maximumAge: GEO_MAX_AGE_MS,
        }
      );
    },
  };
})();
  let lastWeather = null;

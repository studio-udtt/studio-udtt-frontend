const KOREA_TIME_ZONE = "Asia/Seoul";
const TIME_ZONE_PATTERN = /(?:Z|[+-]\d{2}:?\d{2})$/;

const parseAwsDateTime = (value) => {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value !== "string") {
    return new Date(value);
  }

  const trimmedValue = value.trim();
  const hasTime = trimmedValue.includes("T") || trimmedValue.includes(" ");
  const hasTimeZone = TIME_ZONE_PATTERN.test(trimmedValue);
  const normalizedValue =
    hasTime && !hasTimeZone ? `${trimmedValue.replace(" ", "T")}Z` : value;

  return new Date(normalizedValue);
};

export const formatKoreaDateTime = (value, options = {}) => {
  const fallback = options.fallback ?? "-";
  const date = parseAwsDateTime(value);

  if (!date) return fallback;

  if (Number.isNaN(date.getTime())) {
    return value || fallback;
  }

  return date.toLocaleString("ko-KR", {
    timeZone: KOREA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...options.format,
  });
};

export const formatKoreaTime = (value, options = {}) => {
  const fallback = options.fallback ?? "-";
  const date = parseAwsDateTime(value);

  if (!date) return fallback;

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleTimeString("ko-KR", {
    timeZone: KOREA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    ...options.format,
  });
};

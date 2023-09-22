import { format as formatDateFn } from "date-fns";
import * as dayjs from "dayjs";
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
export function formatDateTime(time) {
  return formatDateFn(time, "yyyy MM dd HH:mm:ss");
}
export function formatime(time) {
  return formatDateFn(time, "HH:mm:ss");
}
export function formatDate(time) {
  return formatDateFn(time * 1000, "dd MMM yyyy");
}

export function getTimeRemaining(time) {
  const now = parseInt(String(Date.now() / 1000));
  if (time < now) {
    return "0h 0m";
  }
  const diff = time - now;
  const hours = parseInt(String(diff / (60 * 60)));
  const minutes = parseInt(String((diff - hours * 60 * 60) / 60));
  return `${hours}h ${minutes}m`;
}

export function isValidTimestamp(timestamp) {
  return new Date(timestamp).getTime() > 0;
}
export function serverTimeToClientTime(timestamp, format, serverTimezoneOffset) {
  if (timestamp) {
    let offset = serverTimezoneOffset || serverTimezoneOffset == 0 ? serverTimezoneOffset : 8;
    // console.log("offset", offset);
    let utcTime = "";
    if (offset < 0) {
      utcTime = dayjs(timestamp).add(Math.abs(offset), "hour").format("YYYY-MM-DD HH:mm:ss");
    } else if (offset > 0) {
      utcTime = dayjs(timestamp).subtract(Math.abs(offset), "hour").format("YYYY-MM-DD HH:mm:ss");
    } else {
      utcTime = dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss");
    }
    // console.log("utcTime", utcTime);
    return dayjs
      .utc(utcTime)
      .local()
      .format(format || "YYYY-MM-DD HH:mm:ss");
  } else {
    return "--";
  }
}
export function clientTimeToserverTime(timestamp, format, serverTimezoneOffset) {
  if (timestamp) {
    let serverOffset = serverTimezoneOffset || serverTimezoneOffset == 0 ? serverTimezoneOffset : 8;
    let clientOffset = dayjs().utcOffset() / 60;
    let offset = serverOffset - clientOffset;
    // console.log("offset", offset);
    // console.log("offset", offset);
    let serverTime = "";
    if (offset > 0) {
      serverTime = dayjs(timestamp)
        .add(offset, "hour")
        .format(format || "YYYY-MM-DD HH:mm:ss");
    } else if (offset < 0) {
      serverTime = dayjs(timestamp)
        .subtract(Math.abs(offset), "hour")
        .format(format || "YYYY-MM-DD HH:mm:ss");
    } else {
      serverTime = dayjs(timestamp).format(format || "YYYY-MM-DD HH:mm:ss");
    }
    // console.log("serverTime", serverTime);
    return serverTime;
    // return dayjs.utc(utcTime).local().format("YYYY-MM-DD HH:mm:ss");
  } else {
    return "--";
  }
}
export function utcToClient(timestamp) {
  return timestamp ? dayjs.utc(timestamp).local().format("YYYY-MM-DD HH:mm:ss") : "--";
}

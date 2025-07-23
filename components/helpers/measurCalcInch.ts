export const measurCalcInch = (value: number, measurementSystem: string) => {
  if (measurementSystem === "imperial") {
    return value / 2.54; // Конвертируем сантиметры в дюймы
  }
  return value;
};
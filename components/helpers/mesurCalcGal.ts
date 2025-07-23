export const measurCalcGal = (value: number, measurementSystem: string) => {
  if (measurementSystem === "imperial") {
    return value / 3.78541; // Конвертируем литры в галлоны
  }
  return value;
};
export const measurCalcInch = (value: number, measurementSystem: string) => {
  if (measurementSystem === "imperial") {
    return value * 2.54;
  }
  return value;
};
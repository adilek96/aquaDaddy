export const measurCalcGal = (value: number, measurementSystem: string) => {
  if (measurementSystem === "imperial") {
    return value * 3.78541;
  }
  return value;
};
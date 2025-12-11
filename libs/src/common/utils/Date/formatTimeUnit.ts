const formatTimeUnit = (value: number, padStart = false): string =>
  padStart ? value.toString().padStart(2, '0') : value.toString();

export default formatTimeUnit;

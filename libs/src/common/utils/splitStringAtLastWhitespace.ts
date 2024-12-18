function splitAtLastWhitespace(input: string) {
  const lastSpaceIndex = input.lastIndexOf(' ');
  if (lastSpaceIndex === -1) {
    return [input, ''];
  }
  return [input.slice(0, lastSpaceIndex), input.slice(lastSpaceIndex + 1)];
}

export default splitAtLastWhitespace;

function generateRandomString(length: number) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = uppercase + lowercase + (Math.random() < 0.5 ? numbers : specialChars);

  const getRandomChar = (charSet: string) => charSet[Math.floor(Math.random() * charSet.length)];

  const randomChars = [
    getRandomChar(uppercase),
    getRandomChar(lowercase),
    getRandomChar(Math.random() < 0.5 ? numbers : specialChars),
  ];

  while (randomChars.length < length) {
    randomChars.push(getRandomChar(allChars));
  }

  for (let i = randomChars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomChars[i], randomChars[j]] = [randomChars[j], randomChars[i]];
  }

  return randomChars.join('');
}

export default generateRandomString;

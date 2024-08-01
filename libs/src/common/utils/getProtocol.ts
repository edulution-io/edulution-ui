const getProtocol = (url: string): string => (url.startsWith('https') ? 'https' : 'http');

export default getProtocol;

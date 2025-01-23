const isDevelopment = process.env['NODE_ENV'] === 'development';

const getFrontEndUrl = (): string => {
  if (isDevelopment) {
    return `${window.location.protocol}//host.docker.internal:5173`;
  }
  return `${window.location.protocol}//${window.location.host}`;
};

export default getFrontEndUrl;

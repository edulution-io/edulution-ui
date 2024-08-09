const getUserRegex = (username: string): RegExp => new RegExp(String.raw`CN=${username},`, 'g');

export default getUserRegex;

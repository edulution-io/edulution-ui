const extractCnValue = (dn: string): string => dn.split(',')[0].split('=')[1].replace('role-', '');

export default extractCnValue;

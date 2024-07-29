import { sign } from 'jsonwebtoken';

const signJwtContent = (payload: string, key: string) => sign(payload, key);

export default signJwtContent;

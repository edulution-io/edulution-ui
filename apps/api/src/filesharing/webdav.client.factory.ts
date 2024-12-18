import axios from 'axios';
import https from 'https';

class WebdavClientFactory {
  static createWebdavClient(baseUrl: string, username: string, password: string) {
    const token = Buffer.from(`${username}:${password}`).toString('base64');

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    return axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/xml',
        Authorization: `Basic ${token}`,
      },
      httpsAgent,
    });
  }
}

export default WebdavClientFactory;

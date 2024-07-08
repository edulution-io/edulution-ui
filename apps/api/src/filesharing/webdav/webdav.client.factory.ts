import axios from 'axios';

class WebdavClientFactory {
  static createWebdavClient(baseUrl: string, username: string, password: string) {
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    return axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/xml',
        Authorization: `Basic ${token}`,
      },
    });
  }
}

export default WebdavClientFactory;

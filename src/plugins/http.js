import os from 'os';
import {
  http, cookies, toast, md5, moment,
} from '../src/utils/common';
import i18n from '../src/setup/i18n-setup';
import { typeOf } from '../src/utils';
import jockey from '../src/utils/jockey';

const xhrDefaultConfig = {
  headers: {
    OS: JSON.stringify({
      platform: os.platform(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),
      endianness: os.endianness(),
      arch: os.arch(),
      tmpdir: os.tmpdir(),
      type: os.type(),
    }),
    'Content-Type': 'application/json;charset=UTF-8',
    'Cache-Control': 'no-cache',
    // 'User-Agent': os.release(),
    DEVICESOURCE: 'web',
    Accept: 'application/json',
  },
  // timeout: 1000,
};

function httpInit(instance) {
  instance.interceptors.request.use(config => ({
    ...config,
    headers: {
      ...xhrDefaultConfig.headers,
      deviceID: md5(`${navigator.userAgent}${cookies.get('token')}`),
      token: cookies.get('token'),
      'X-B3-Traceid': moment().valueOf() * 1000, // Traceid
      'X-B3-Spanid': moment().valueOf() * 1000,
      'Accept-Language': i18n.locale,
    },
    /* transformRequest: [
      // Do whatever you want to transform the data
      (data = {}/!* , headers *!/) => (typeOf(data) === 'object'
        ? JSON.stringify(Object.assign({ lang: i18n.locale }, { data }))
        : data),
    ], */
  }), (error) => {
    toast(error.message);
    return Promise.reject(error);
  });

  instance.interceptors.response.use((/* response */{ data = {} }) => {
    // Do something with response data
    if (typeOf(data) !== 'object') return data;
    switch (data?.code) {
      case '100000': // 去登录
        toast(i18n.t('xhrError[0]'));
        cookies.expire('token');
        jockey.send('login'); // 原生登录
        return Promise.reject(new Error(i18n.t('xhrError[1]', { code: data.code })));
      case '000000': // 正常
        return data.data;
      /* case '100007':
        return data; // 账户已经存在 */
      default:
        try {
          toast(data.msg || data.message);
          return Promise.reject(new Error(data.msg));
        } catch (error) {
          return data;
        }
    }
  }, (error) => {
    const { response } = error;
    toast(response.message || response.data.msg);
    return Promise.reject(response);
  });

  return instance;
}

export default typeof Proxy === 'undefined' ? {
  instance: (uri) => {
    const { baseURL = uri, timeout } = xhrDefaultConfig;
    return httpInit(http.create({
      baseURL,
      timeout,
    }));
  },
} : new Proxy(Object.create(null),
  {
    get(target, key) {
      if (key === 'instance') return null;
      const { baseURL = key, timeout } = xhrDefaultConfig;
      return httpInit(http.create({
        baseURL,
        timeout,
      }));
    },
  });

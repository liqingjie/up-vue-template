import mqtt from 'mqtt';
import store from '../src/store';

class MQTTService {
  /**
   * 业务方获取推送服务
   * @param options
   *           .domain            string(Y)
   *           .username          string(Y)
   *           .password          string(Y)
   *           .clientId          string(Y)
   */
  constructor(topic) {
    const { mqttConfig } = store.getters;
    this.client = mqtt.connect(...Object.values(mqttConfig));
    this.topic = topic;
  }

  // onConnect() {}

  get subscribe() {
    const { client, topic } = this;
    return (success, failed) => {
      client.on('message', (_topic, message) => _topic === topic && success && success(JSON.parse(message).data));
      if (failed) client.on('error', failed);
      client.subscribe(topic, err => err && failed && failed(err));
      return client;
    };
  }

  // onReconnect() {}

  // onClose() {}

  get unsubscribe() {
    const { client, topic } = this;
    return new Promise((
      resolve, reject,
    ) => client.unsubscribe(topic, error => (error ? reject(error) : resolve(true))));
  }

  close() {
    return this.client.end();
  }
}

export default MQTTService;

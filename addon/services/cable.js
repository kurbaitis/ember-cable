import Service from '@ember/service';
import { getOwner } from '@ember/application';
import Consumer from 'ember-cable/core/consumer';

export default Service.extend({
  init() {
    this._super();
    this._consumers = [];
  },

  createConsumer(url, events) {
    let consumer = Consumer.create(getOwner(this).ownerInjection(), { url, events });
    this._consumers.push(consumer);
    return consumer;
  },

  willDestroy() {
    this._super();
    this._consumers.forEach(consumer => consumer.destroy());
  }
});

import Ember from 'ember';
import Consumer from 'ember-cable/core/consumer';

export default Ember.Service.extend({

  createConsumer(url, events) {
    return Consumer.create(Ember.getOwner(this).ownerInjection(), { url, events });
  }

});

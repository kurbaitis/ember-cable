import { run } from '@ember/runloop';
import EmberObject, { computed, set, get } from '@ember/object';

const ConnectionMonitor = EmberObject.extend({
  connection: null,
  stoppedAt: null,
  startedAt: null,
  pingedAt: null,
  disconnectedAt: null,
  staleThreshold: 6,
  reconnectAttempts: 0,
  _intervalTimer: null,
  _nextPollAt: null,

  init() {
    this._super(...arguments);
    this.start();
  },

  nextConnectionAt: computed.and('notConnected', '_nextPollAt'),
  notConnected: computed.not('connection.connected'),

  start() {
    set(this,'reconnectAttempts', 0);
    set(this, 'stoppedAt', null);
    set(this, 'startedAt', Date.now());
    this.poll();
  },

  connected() {
    set(this,'reconnectAttempts', 0);
    set(this,'pingedAt', Date.now());
    set(this,'disconnectedAt', null);
  },

  disconnected() {
    set(this,'disconnectedAt', Date.now());
  },

  ping() {
    set(this,'pingedAt', Date.now());
  },

  poll() {
    const interval = this.interval();

    this._intervalTimer = setTimeout(() => {
      run(() => {
        this.reconnectIfStale();
        this.poll();
      });
    }, interval);

    run(() => {
      set(this, '_nextPollAt', Math.round(Date.now() + interval));
    });
  },

  willDestroy() {
    this._super();
    clearTimeout(this._intervalTimer);
  },

  interval() {
    return Math.max(3, Math.min(30, 5 * Math.log(get(this,'reconnectAttempts') + 1) )) * 1000;
  },

  reconnectIfStale() {
    if(this.connectionIsStale() && Ember.isEqual(this.get('connection.connected'), true)) {
      this.incrementProperty('reconnectAttempts');
      if(!this.disconnectedRecently()) {
        get(this,'connection').reopen();
      }
    }
  },

  connectionIsStale() {
    return !get(this,'connection.isConnecting') && this.secondsSince(get(this,'pingedAt') || get(this,'startedAt')) > get(this,'staleThreshold');
  },

  disconnectedRecently() {
    return get(this,'disconnectedAt') && this.secondsSince(get(this,'disconnectedAt') ) < get(this,'staleThreshold');
  },

  secondsSince(time) {
    return (Date.now() - time) / 1000;
  }
});

ConnectionMonitor.toString = () => 'ConnectionMonitor';

export default ConnectionMonitor;

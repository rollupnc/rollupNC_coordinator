import EventEmitter from 'events';

const successfullPollEvent = 'poll'

class Poller extends EventEmitter {
  /**
   * @param {int} timeout how long should we wait after the poll started?
   */
  constructor(timeout) {
    super();
    this.timeout = timeout;
  }

  poll() {
    setTimeout(() => this.emit(successfullPollEvent), this.timeout);
  }

  onPoll(cb) {
    this.on(successfullPollEvent, cb);
  }
}

export default Poller;
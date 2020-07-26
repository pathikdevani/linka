function isFunction(fun) {
  return fun && typeof fun === 'function';
}

const REQUEST = 0;
const RESPONSE = 1;

function Linka(on, send, options = {}) {
  // throw error in-case of wrong params
  if (!(isFunction(on) && isFunction(send))) {
    throw new Error('Wrong params!');
  }

  // local variables
  let messageId = 0;
  const outgoing = {};
  const listeners = {};
  const { timeout = 0 } = options;

  // generate unique message id for each request
  function getId() {
    messageId += 1;
    return messageId;
  }

  // To send request and get async response
  // key: should be unique identifier for action
  // data: any - it will get passed to other side of channel
  // returns promise with repose from other side
  this.request = (key, data) => {
    return new Promise((resolve, reject) => {
      const id = getId();
      const isTimeout = timeout > 0;
      let timer = null;
      if (isTimeout) {
        timer = setTimeout(() => {
          delete outgoing[id];
          reject(new Error('Timeout error!'));
        }, timeout);
      }

      outgoing[id] = (e) => { if (timer) { clearTimeout(timer); } resolve(e); };
      send({
        id,
        kind: REQUEST,
        key,
        data,
      });
    });
  };

  // bind to listen event from other side
  this.bind = (key, callback) => {
    listeners[key] = callback;
  };

  // to handle event and invoice listener(what we bind) and send response
  on((e) => {
    if (e && e.id && e.kind === RESPONSE) {
      const out = outgoing[e.id];
      if (out) {
        delete outgoing[e.id];
        out(e.data);
      }
    } else if (e && e.id && e.kind === REQUEST) {
      const listener = listeners[e.key];
      if (listener) {
        listener(e.data)
          .then((data) => {
            const id = getId();
            send({
              id,
              kind: RESPONSE,
              key: e.key,
              data,
            });
          });
      }
    }
  });
}

export default Linka;

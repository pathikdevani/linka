function Channel() {
  let server = {};
  const client = {
    send: (data) => {
      server.on(data);
    },
  };
  server = {
    send: (data) => {
      client.on(data);
    },
  };

  return {
    client,
    server,
  };
}

export default Channel;

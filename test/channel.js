function Channel() {
	const client = {
		send: (data) => {
			server.on(data);
		}
	};
	const server = {
		send: (data) => {
			client.on(data);
		}
	};

	return {
		client,
		server,
	};
}

export default Channel;

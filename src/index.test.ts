import * as mocha from "mocha";
import * as chai from "chai";

import { Data, Linka, Params } from ".";

type Agent = {
	on: (data: Data) => void;
	send: (data: Data) => void;
};

function Channel() {
	let server: Agent;
	const client = {
		send: (data: Data) => {
			if (server) {
				server.on(data);
			}
		},
		on: (data: Data) => {},
	};
	server = {
		send: (data: Data) => {
			client.on(data);
		},
		on: (data: Data) => {},
	};

	return {
		client,
		server,
	};
}

function mock(options: { timeout: number } = { timeout: 0 }) {
	const { server, client } = Channel();
	const linkaClient = new Linka({
		on: (callback) => {
			client.on = (data) => {
				callback(data);
			};
		},
		send: (data) => {
			client.send(data);
		},
		options: options,
	});

	const linkaServer = new Linka({
		on: (callback) => {
			server.on = (data) => {
				callback(data);
			};
		},
		send: (data) => {
			server.send(data);
		},
		options: options,
	});
	return {
		client: linkaClient,
		server: linkaServer,
	};
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const expect = chai.expect;

describe("My math library", () => {
	it("should be able to add things correctly", () => {
		expect(3 + 4).to.equal(7);
	});

	it("In process", async () => {
		const { client, server } = mock();
		server.bind("test", async () => {
			return 1;
		});
		server.bind("getFullName", async (e) => {
			return `${e.fname} ${e.lname}`;
		});
		const data = await client.request("test");
		expect(data).to.eql(1);
		const name = await client.request("getFullName", {
			fname: "foo",
			lname: "bar",
		});
		expect(name).to.eql("foo bar");
	});

	it("time out", async () => {
		const { client, server } = mock({ timeout: 1000 });

		server.bind("getName0ms", async () => {
			return "foo bar";
		});

		server.bind("getName100ms", async () => {
			await sleep(100);
			return "foo bar";
		});

		server.bind("getName2000ms", async () => {
			await sleep(10000);
			return "foo bar";
		});

		const name10ms = await client.request("getName0ms");
		expect(name10ms).to.eql("foo bar");

		const name100ms = await client.request("getName100ms");
		expect(name100ms).to.eql("foo bar");

		let failed = false;
		try {
			await client.request("getName2000ms");
		} catch (error) {
			failed = true;
		}
		expect(failed).to.eql(true);
	});
});

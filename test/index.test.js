import { test } from 'uvu';
import * as assert from 'uvu/assert';

import Linka from '../src';
import Channel from './channel';

test('in process', async (done) => {
	const { client, server } = new Channel();
	const linkaClient = new Linka((callback) => {
		client.on = (data) =>{ callback(data); };
	}, (data) => {
		client.send(data);
	});
	const linkaServer = new Linka((callback) => {
		server.on = (data) =>{
			 callback(data);
		};
	}, (data) => {
		server.send(data);
	});

	linkaServer.bind('test', async () => {
		return 124;
	});

	linkaServer.bind('getFullName', async (e) => {
		return `${e.fname} ${e.lname}`;
	});

	const data = await linkaClient.request("test");
	assert.is(data, 124);


	const name = await linkaClient.request('getFullName', {fname: 'foo', lname: 'boo'});
	console.log('Name', name);
});

test.run();

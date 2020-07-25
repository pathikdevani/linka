import { describe, expect, test } from '@jest/globals';
// import * as assert from 'uvu/assert';

import Linka from '../src';
import Channel from './channel';

function inProcess(options) {
  const { client, server } = new Channel();
  const linkaClient = new Linka((callback) => {
    client.on = (data) => { callback(data); };
  }, (data) => {
    client.send(data);
  }, options);
  const linkaServer = new Linka((callback) => {
    server.on = (data) => {
      callback(data);
    };
  }, (data) => {
    server.send(data);
  }, options);

  return { client: linkaClient, server: linkaServer };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function params(a, b) {
  let failed = false;
  try {
    new Linka(a, b);
  } catch (error) {
    failed = true;
  }
  return !failed;
}

describe('Linka tests', () => {
  test('arguments', () => {
    const noop = () => {};
    expect(params(noop, noop)).toBeTruthy();
    expect(params(undefined, noop)).toBeFalsy();
    expect(params(noop, undefined)).toBeFalsy();
    expect(params(undefined, undefined)).toBeFalsy();
  });

  test('in process', async () => {
    expect(false).toBe(false);

    const { client, server } = inProcess();

    server.bind('test', async () => {
      return 1;
    });

    server.bind('getFullName', async (e) => {
      return `${e.fname} ${e.lname}`;
    });

    const data = await client.request('test');
    expect(data).toBe(1);

    const name = await client.request('getFullName', { fname: 'foo', lname: 'bar' });
    expect(name).toBe('foo bar');
  });

  test('time out', async () => {
    const { client, server } = inProcess({ timeout: 1000 });

    server.bind('getName0ms', async () => {
      return 'foo bar';
    });

    server.bind('getName100ms', async () => {
      await sleep(100);
      return 'foo bar';
    });

    server.bind('getName2000ms', async () => {
      await sleep(10000);
      return 'foo bar';
    });

    const name10ms = await client.request('getName0ms');
    expect(name10ms).toBe('foo bar');

    const name100ms = await client.request('getName100ms');
    expect(name100ms).toBe('foo bar');

    let failed = false;
    try {
      await client.request('getName2000ms');
    } catch (error) {
      failed = true;
    }
    expect(failed).toBe(true);
  });
});

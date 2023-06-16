export type Params = {
	on: (handler: (data: Data) => void) => void;
	send: (data: Data) => void;
	options: { timeout: number };
};

export enum Kind {
	RESPONSE,
	REQUEST,
}

export type Data = {
	id: number;
	kind: Kind;
	key: string;
	data: any;
};

type AsyncFn = (data: any) => Promise<any>;
type Fn = (data: any) => void;

export class Linka {
	private params: Params;
	private listeners = new Map<string, AsyncFn>();
	private outgoing = new Map<number, Fn>();
	private idCounter: number = 0;

	constructor(params: Params) {
		this.params = params;
		this.params.on(this.on.bind(this));
	}

	getId() {
		this.idCounter += 1;
		return this.idCounter;
	}

	bind = (key, fn: AsyncFn) => {
		this.listeners.set(key, fn);
	};

	request(key: string, data?: any) {
		return new Promise<any>((resolve, reject) => {
			const id = this.getId();
			const timeout = this.params.options.timeout || 0;
			const isTimeout = timeout > 0;
			let timer = null;
			if (isTimeout) {
				timer = setTimeout(() => {
					this.outgoing.delete(id);
					reject(new Error("Timeout error!"));
				}, timeout);
			}

			this.outgoing.set(id, (e) => {
				if (timer) {
					clearTimeout(timer);
				}
				resolve(e);
			});
			this.params.send({
				id,
				kind: Kind.REQUEST,
				key,
				data,
			});
		});
	}

	private on(data: Data) {
		if (data && data.key && data.id) {
			if (data.kind === Kind.REQUEST) {
				const listener = this.listeners.get(data.key);
				if (listener) {
					listener(data.data).then((e) => {
						this.params.send({
							id: data.id,
							kind: Kind.RESPONSE,
							key: data.key,
							data: e,
						});
					});
				}
			} else if (data.kind == Kind.RESPONSE) {
				const out = this.outgoing.get(data.id);
				if (out) {
					this.outgoing.delete(data.id);
					out(data.data);
				}
			}
		}
	}
}

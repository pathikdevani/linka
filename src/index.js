function isFunction(fun){
	return fun && typeof fun === "function";
}

const REQUEST = 0;
const RESPONSE = 1;

function Linka(on, send) {
	if(!(isFunction(on) && isFunction(send))){
		throw new Error('please pass proper function as argument!')
	}

	let messageId = 0;
	const outgoing = {};
	const listeners = {};


	function getId() {
		messageId += 1;
		return messageId;
	}

	this.request = (key, data) => {
		return new Promise((resolve, reject) => {
			const id = getId();
			outgoing[id] = (e) => { resolve(e); };
			send({
				id,
				kind: REQUEST,
				key,
				data,
			})
		});
	};

	this.bind = (key, callback) => {
		listeners[key] = callback;
	};

	on((e) => {
		if(e && e.id) {
			if(e.kind === RESPONSE) {
				const out = outgoing[e.id];
				if(out){
					delete outgoing[e.id]
					out(e.data);
				}
			} else if(e.kind === REQUEST) {
				const listener = listeners[e.key];
				if(listener) {
					listener(e.data).then((data) => {
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
		}
	});
}

export default Linka;

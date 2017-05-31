
/*
 * POLYFILLS
 */

const _log   = console.log   || function() {};
const _info  = console.info  || console.log;
const _warn  = console.warn  || console.log;
const _error = console.error || console.log;


const _INDENT         = '    ';
const _WHITESPACE     = new Array(512).fill(' ').join('');
const _args_to_string = function(args) {

	let output  = [];
	let columns = process.stdout.columns;

	for (let a = 0, al = args.length; a < al; a++) {

		let value = args[a];
		let o     = 0;

		if (value instanceof Object) {

			let tmp = [];

			try {

				let cache = [];

				tmp = JSON.stringify(value, function(key, value) {

					if (value instanceof Object) {

						if (cache.indexOf(value) === -1) {
							cache.push(value);
							return value;
						} else {
							return undefined;
						}

					} else {
						return value;
					}

				}, _INDENT).split('\n');

			} catch (err) {
			}

			if (tmp.length > 1) {

				for (let t = 0, tl = tmp.length; t < tl; t++) {
					output.push(tmp[t]);
				}

				o = output.length - 1;

			} else {

				let chunk = output[o];
				if (chunk === undefined) {
					output[o] = tmp[0].trim();
				} else {
					output[o] = (chunk + ' ' + tmp[0]).trim();
				}

			}

		} else if (typeof value === 'string' && value.includes('\n')) {

			let tmp = value.split('\n');

			for (let t = 0, tl = tmp.length; t < tl; t++) {
				output.push(tmp[t]);
			}

			o = output.length - 1;

		} else {

			let chunk = output[o];
			if (chunk === undefined) {
				output[o] = ('' + value).replace(/\t/g, _INDENT);
			} else {
				output[o] = (chunk + (' ' + value).replace(/\t/g, _INDENT));
			}

		}

	}


	let ol = output.length;
	if (ol > 1) {

		for (let o = 0; o < ol; o++) {

			let line = output[o];
			let maxl = (o === 0 || o === ol - 1) ? (columns - 1) : columns;
			if (line.length > maxl) {
				output[o] = line.substr(0, maxl);
			} else {
				output[o] = line + _WHITESPACE.substr(0, maxl - line.length);
			}

		}

		return output.join('\n');

	} else {

		let line = output[0];
		let maxl = columns - 2;
		if (line.length > maxl) {
			return line.substr(0, maxl);
		} else {
			return line + _WHITESPACE.substr(0, maxl - line.length);
		}

	}

};



console.clear = function() {

	// clear screen and reset cursor
	process.stdout.write('\x1B[2J\x1B[0f');

	// clear scroll buffer
	process.stdout.write('\u001b[3J');

};

console.log = function() {

	let al   = arguments.length;
	let args = [];
	for (let a = 0; a < al; a++) {
		args.push(arguments[a]);
	}

	process.stdout.write('\u001b[49m\u001b[97m ' + _args_to_string(args) + ' \u001b[39m\u001b[49m\u001b[0m\n');

};

console.info = function() {

	let al   = arguments.length;
	let args = [];
	for (let a = 0; a < al; a++) {
		args.push(arguments[a]);
	}

	process.stdout.write('\u001b[42m\u001b[97m ' + _args_to_string(args) + ' \u001b[39m\u001b[49m\u001b[0m\n');

};

console.warn = function() {

	let al   = arguments.length;
	let args = [];
	for (let a = 0; a < al; a++) {
		args.push(arguments[a]);
	}

	process.stdout.write('\u001b[43m\u001b[97m ' + _args_to_string(args) + ' \u001b[39m\u001b[49m\u001b[0m\n');

};

console.error = function() {

	let al   = arguments.length;
	let args = [];
	for (let a = 0; a < al; a++) {
		args.push(arguments[a]);
	}

	process.stderr.write('\u001b[41m\u001b[97m ' + _args_to_string(args) + ' \u001b[39m\u001b[49m\u001b[0m\n');

};


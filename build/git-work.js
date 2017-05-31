#!/usr/bin/env node

const GIT_WORK = {
	token:   null,
	issues:  [],
	email:   null,
	remotes: []
};



/*
 * CONFIG INTEGRATION
 */

(function(global, cwd) {

	const _fs = require('fs');

	let user_config = null;
	let user_home   = process.env.HOME || null;
	let repo_config = null;
	let repo_token  = null;
	let repo_issues = null;

	if (!_fs.existsSync(cwd + '/.github')) {
		_fs.mkdirSync(cwd + '/.github');
	}

	try {
		user_config = _fs.readFileSync(user_home + '/.gitconfig', 'utf8');
	} catch (err) {
	}

	try {
		repo_config = _fs.readFileSync(cwd + '/.git/config', 'utf8');
	} catch (err) {
	}

	try {
		repo_issues = JSON.parse(_fs.readFileSync(cwd + '/.github/ISSUES', 'utf8'));
	} catch (err) {
	}

	try {
		repo_token  = _fs.readFileSync(cwd + '/.github/TOKEN', 'utf8');
	} catch (err) {
	}


	if (user_config !== null) {

		GIT_WORK.email = user_config
		.split('\n')
		.filter(val => val.trim().substr(0, 5) === 'email')
		.map(val => val.split('=')[1].trim())[0] || null;

	}

	if (repo_config !== null) {

		let remote_id = null;

		GIT_WORK.remotes = repo_config
		.split('\n')
		.map(val => val.trim())
		.filter(val => /^url|\[remote/g.test(val))
		.map(function(line) {

			if (/^\[remote/.test(line)) {

				remote_id = line.split(/"|\]/g)[1];

			} else if (/^url/.test(line) && /github\.com/g.test(line)) {

				let url = line.split('=')[1].trim();

				if (/^git@/.test(url)) {

					let tmp = url.split(':')[1].split('.git')[0].split('/');

					return {
						id:   remote_id,
						orga: tmp[0],
						repo: tmp[1]
					};

				} else if (/^https:\/\//g.test(url)) {

					let tmp = url.split('github.com/')[1].split('.git')[0].split('/');

					return {
						id:   remote_id,
						orga: tmp[0],
						repo: tmp[1]
					};

				}

			}


			return null;

		}).filter(val => val !== null);

	}


	if (repo_issues !== null && repo_issues.length > 0) {
		GIT_WORK.issues = repo_issues;
	}


	if (repo_token !== null) {
		GIT_WORK.token = repo_token.trim();
	}

})(typeof global !== 'undefined' ? global : this, process.cwd());


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



GIT_WORK.help = (function(global, cwd) {

	return function(args) {

		let action = args[0] || '';
		if (action.length > 0) {

			let suggestion = null;
			if (/([show]{4})/g.test(action)) {
				suggestion = 'show';
			} else if (/([sync]{4})/g.test(action)) {
				suggestion = 'sync';
			}


			if (suggestion !== null) {

				console.log('git-work: "' + action + '" is not a git-work command.');
				console.log('');
				console.log('Did you mean "git work ' + suggestion + '"?');

			}

		} else {

			console.log('');
			console.info('git work v2017.05.31');
			console.log('');
			console.log('Usage: git work [action] [filters]');
			console.log('');
			console.log('');
			console.log('Available Actions:');
			console.log('');
			console.log('    sync              syncs all open issues');
			console.log('    show              shows all open issues');
			console.log('    show [number]     shows issue details');
			console.log('');
			console.log('Available Filters:');
			console.log('');
			console.log('    --assignee        filters by assignee');
			console.log('    --label           filters by label');
			console.log('    --milestone       filters by milestone');
			console.log('    --remote          filters by remote');
			console.log('');
			console.log('Examples:');
			console.log('');
			console.log('    git work sync;');
			console.log('    git work show;');
			console.log('    git work show 123;');
			console.log('');
			console.log('Filter Examples:');
			console.log('');
			console.log('    git work sync --remote="upstream";');
			console.log('    git work show --assignee="cookiengineer";');
			console.log('    git work show --milestone="2017-Q4";');
			console.log('');

		}

	};

})(typeof global !== 'undefined' ? global : this, process.cwd());


GIT_WORK.show = (function(global) {

	const _EMPTY        = ' ' + new Array(1024).join(' ');
	const _DIVIDOR      = '=' + new Array(1024).join('=');
	const _render_chunk = function(value, width, prefix) {

		prefix = prefix === true;


		let chunk = '' + value;
		if (chunk.length > width) {
			chunk = chunk.substr(0, width);
		} else if (chunk.length < width) {

			if (prefix === true) {
				chunk = _EMPTY.substr(0, width - chunk.length) + chunk;
			} else {
				chunk = chunk + _EMPTY.substr(0, width - chunk.length);
			}

		}

		return chunk;

	};

	const _render_title = function(title) {

		let max_width = process.stdout.columns - 2;

		console.log(_EMPTY.substr(0, max_width));
		console.log(title);
		console.log(_EMPTY.substr(0, max_width));

	};

	const _render_body = function(body) {

		let max_width = process.stdout.columns - 2;

		body.split('\n').map(line => line.trim()).forEach(line => {

			if (line.length < max_width) {

				console.log(line);

			} else {

				console.log(line.substr(0, max_width));


				let rest = line.substr(max_width);

				while (rest.length > 0) {

					console.log(rest.substr(0, max_width));
					rest = rest.substr(max_width);

					if (rest.trim() === '') {
						break;
					}

				}


			}

		});

	};

	const _render_issue = function(issue, widths, filters) {

		let tmp = [];

		if (filters.assignee !== null) {
			tmp.push(filters.assignee === issue.assignee);
		}

		if (filters.label !== null) {
			tmp.push(issue.labels.includes(filters.label));
		}

		if (filters.milestone !== null) {
			tmp.push(filters.milestone === issue.milestone);
		}


		let max_width = process.stdout.columns || Infinity;
		let assignee  = (issue.assignee === null ? '-' : '@' + issue.assignee);
		let line      = _render_chunk('#' + issue.number, widths.number + 1, true) + ' ' + _render_chunk('(' + assignee + '):', widths.assignee + 4) + ' ' + _render_chunk(issue.title, widths.title);

		if (line.length > max_width) {

			line = _render_chunk('#' + issue.number, widths.number + 1, true) + ': ' + _render_chunk(issue.title, widths.title);

			if (line.length > max_width) {
				line = _render_chunk(line, max_width);
			}

		}

		let is_highlighted = tmp.find(v => v === false) === undefined;
		if (tmp.length > 0 && is_highlighted === true) {
			console.info(line);
		} else {
			console.log(line);
		}

	};

	const _render_issue_detail = function(issue) {

		console.info(_DIVIDOR);
		console.info('URL:       ' + issue.url.web);
		console.info('Title:     ' + issue.title);
		console.info('Assignee:  ' + (issue.assignee === null ? '-' : '@' + issue.assignee));
		console.info('Milestone: ' + (issue.milestone === null ? '-' : issue.milestone));
		console.info('Labels:    ' + (issue.labels.length === 0 ? '-' : issue.labels.join(', ')));
		console.info(_DIVIDOR);

		console.log('');
		_render_body(issue.body);

		issue.comments.forEach(comment => {

			if (comment !== null) {

				console.log('');
				console.log('');
				console.log('');

				console.info(_DIVIDOR);
				console.info('@' + comment.user + ' wrote at ' + comment.updated_at + ':');
				console.info(_DIVIDOR);

				console.log('');
				_render_body(comment.body);

			}

		});

	};


	return function(args, filters) {

		let is_detail = typeof args[1] === 'string';
		if (is_detail === true) {

			let number = parseInt(args[1], 10);
			let issues = GIT_WORK.issues.filter(issue => issue.number === number);
			if (issues.length > 0) {

				issues.forEach(issue => {

					_render_title('Issue #' + issue.number + ' on remote "' + issue.remote + '":');
					_render_issue_detail(issue);

				});

			} else {
				console.warn('Unable to show: No issue #' + args[1] + ' (possibly closed already).');
			}

		} else {

			let remotes = GIT_WORK.remotes.filter(remote => {
				return (filters.remote === null || filters.remote === remote.id);
			});

			if (remotes.length > 0) {

				let work = {};

				remotes.forEach(remote => {

					let issues = GIT_WORK.issues.filter(issue => issue.remote === remote.id);
					if (issues.length > 0) {

						_render_title('Issue overview for remote "' + remote.id + '":');

						console.log(_DIVIDOR);

						let widths = {
							number:    0,
							assignee:  0,
							title:     0,
							milestone: 0
						};

						issues.forEach(issue => {
							widths.number    = Math.max(widths.number,    ('' + issue.number).length);
							widths.assignee  = Math.max(widths.assignee,  ('' + issue.assignee).length);
							widths.title     = Math.max(widths.title,     ('' + issue.title).length);
							widths.milestone = Math.max(widths.milestone, ('' + issue.milestone).length);
						});

						issues.sort((a, b) => {
							if (a.number > b.number) return -1;
							if (b.number > a.number) return  1;
							return 0;
						}).forEach(issue => {
							_render_issue(issue, widths, filters);
						});

						console.log(_DIVIDOR);


						work[remote.id] = true;

					} else {

						work[remote.id] = false;

					}

				});


				let has_work = Object.values(work).find(v => v === true) !== undefined;
				if (has_work === false) {
					console.log('Lucky you! Nothing to work on.');
					console.log('Go browse /r/machinelearning instead?');
				}

			} else {
				console.warn('Unable to show: No remote "' + filters.remote + '".');
			}

		}

	};

})(typeof global !== 'undefined' ? global : this);


GIT_WORK.sync = (function(global, cwd) {

	const _fs          = require('fs');
	const _https       = require('https');
	const _sync_comments = function(remote, issue, callback) {

		let headers = {
			'User-Agent': 'git-work'
		};

		if (GIT_WORK.token !== null) {
			headers['Authorization'] = 'token ' + GIT_WORK.token;
		}


		let request = _https.request({
			method:   'GET',
			protocol: 'https:',
			host:     'api.github.com',
			path:     '/repos/' + remote.orga + '/' + remote.repo + '/issues/' + issue.number + '/comments?per_page=254',
			headers:  headers
		}, function(response) {

			let blob   = '';
			let data   = null;
			let result = [];

			response.setEncoding('utf8');
			response.on('data', chunk => (blob += chunk));
			response.on('end', _ => {

				try {
					data = JSON.parse(blob);
				} catch (err) {
					data = null;
				}


				if (data instanceof Array) {

					data.map(comment => {

						let body = '';

						if (typeof comment.body === 'string') {
							body = comment.body.split('\r\n').join('\n');
						}


						return {
							url: {
								api: comment.url      || null,
								web: comment.html_url || null
							},
							id:         comment.id,
							body:       body.trim(),
							user:       comment.user.login,
							created_at: comment.created_at,
							updated_at: comment.updated_at
						};

					}).forEach((comment, c) => {

						issue.comments[c] = comment;
						result.push(comment);

					});

				} else if (data instanceof Object) {

					let message = data.message || null;
					if (message !== null) {

						console.error('GitHub API Error');
						console.error('URL:     https://api.github.com/repos/' + remote.orga + '/' + remote.repo + '/issues/' + issue.number + '/comments?per_page=254');
						console.error('Message: ' + message);

					}

				}

				callback(result);

			});

		});

		request.on('error',   err => callback(null));
		request.on('timeout', err => callback(null));

		request.setTimeout(10000);
		request.write('');
		request.end();

	};

	const _sync_issues = function(remote, callback) {

		let headers = {
			'User-Agent': 'git-work'
		};

		if (GIT_WORK.token !== null) {
			headers['Authorization'] = 'token ' + GIT_WORK.token;
		}


		let request = _https.request({
			method:   'GET',
			protocol: 'https:',
			host:     'api.github.com',
			path:     '/repos/' + remote.orga + '/' + remote.repo + '/issues?per_page=254&state=open',
			headers:  headers
		}, function(response) {

			let blob   = '';
			let data   = null;
			let result = [];

			response.setEncoding('utf8');
			response.on('data', chunk => (blob += chunk));
			response.on('end', _ => {

				try {
					data = JSON.parse(blob);
				} catch (err) {
					data = null;
				}

				if (data instanceof Array) {

					data.map(issue => {

						let assignee  = null;
						let body      = '';
						let milestone = null;

						if (issue.assignee instanceof Object) {
							assignee  = issue.assignee.login || null;
						}

						if (typeof issue.body === 'string') {
							body = issue.body.split('\r\n').join('\n');
						}

						if (issue.milestone instanceof Object) {
							milestone = issue.milestone.title;
						}


						return {
							url: {
								api: issue.url      || null,
								web: issue.html_url || null
							},
							number:     issue.number,
							remote:     remote.id,
							title:      issue.title.trim(),
							body:       body.trim(),
							comments:   new Array(issue.comments).fill(null),
							assignee:   assignee,
							milestone:  milestone,
							labels:     issue.labels.map(function(label) {
								return label.name;
							}),
							created_at: issue.created_at,
							updated_at: issue.updated_at
						};

					}).forEach(issue => {

						let found = GIT_WORK.issues.find(other => other.number === issue.number && other.remote === issue.remote);
						if (found === undefined) {
							GIT_WORK.issues.push(issue);
							result.push(issue);
						}

					});

				} else if (data instanceof Object) {

					let message = data.message || null;
					if (message !== null) {

						console.error('GitHub API Error');
						console.error('URL:     https://api.github.com/repos/' + remote.orga + '/' + remote.repo + '/issues?per_page=254&state=open');
						console.error('Message: ' + message);

					}

				}


				callback(result);

			});

		});

		request.on('error',   err => callback(null));
		request.on('timeout', err => callback(null));

		request.setTimeout(10000);
		request.write('');
		request.end();

	};


	return function(args, filters) {

		let remotes = GIT_WORK.remotes.filter(remote => {
			return (filters.remote === null || filters.remote === remote.id);
		});

		if (remotes.length > 0) {

			remotes.forEach(remote => {

				console.log('Syncing issues for remote "' + remote.id + '" ...');

				_sync_issues(remote, issues => {

					if (issues === null) {

						console.error('Unable to sync: Timeout for remote "' + remote.id + '".');

					} else if (issues.length > 0) {

						let blob = JSON.stringify(GIT_WORK.issues, null, '\t');
						_fs.writeFileSync(cwd + '/.github/ISSUES', blob, 'utf8');


						issues.filter(issue => issue.comments.length > 0).forEach(issue => {

							console.log('Syncing comments for issue #' + issue.number + ' on remote "' + remote.id + '" ...');

							_sync_comments(remote, issue, result => {
								let blob = JSON.stringify(GIT_WORK.issues, null, '\t');
								_fs.writeFileSync(cwd + '/.github/ISSUES', blob, 'utf8');
							});

						});

					}

				});


			});

		} else {

			console.warn('Unable to sync: No remote "' + filters.remote + '".');

		}

	};

})(typeof global !== 'undefined' ? global : this, process.cwd());


(function(global, argv) {

	let args   = Array.from(argv).filter(v => !v.startsWith('--'));
	let action = argv.find(v => /^(sync|show)$/g.test(v));

	if (action !== undefined && typeof GIT_WORK[action] === 'function') {

		let filters = {
			assignee:  null,
			label:     null,
			milestone: null,
			remote:    null
		};


		Array.from(argv).filter(v => v.startsWith('--')).forEach(value => {

			let tmp = value.substr(2).split('=');
			if (tmp.length === 2) {

				if (tmp[1].startsWith('"')) tmp[1] = tmp[1].substr(1);
				if (tmp[1].endsWith('"'))   tmp[1] = tmp[1].substr(1);
				if (tmp[1].startsWith('#')) tmp[1] = tmp[1].substr(1);

				if (/^([0-9]+)$/g.test(tmp[1])) {

					let num = parseInt(tmp[1], 10);
					if (!isNaN(num)) {
						tmp[1] = num;
					}

				}

				filters[tmp[0]] = tmp[1];

			}

		});


		let has_filter = Object.values(filters).find(v => v !== null) !== undefined;
		if (has_filter === false) {

			filters.remote = 'origin';

			if (GIT_WORK.email !== null) {
				filters.assignee = GIT_WORK.email.split('@')[0].trim();
			}

		}


		console.clear();

		try {
			GIT_WORK[action](args, filters);
		} catch (err) {
			console.error(err.message);
		}

	} else {

		console.clear();
		GIT_WORK.help(args);

	}

})(typeof global !== 'undefined' ? global : this, process.argv.slice(2));


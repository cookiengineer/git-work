
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


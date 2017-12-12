
GIT_WORK.create = (function(global, cwd) {

	const _fs           = require('fs');
	const _https        = require('https');
	const _create_issue = function(remote, issue, callback) {

		let headers = {
			'User-Agent': 'git-work'
		};

		if (GIT_WORK.token !== null) {
			headers['Authorization'] = 'token ' + GIT_WORK.token;
		}


		let json    = JSON.stringify(issue);
		let request = _https.request({
			method:   'POST',
			protocol: 'https:',
			host:     'api.github.com',
			path:     '/repos/' + remote.orga + '/' + remote.repo + '/issues',
			headers:  headers
		}, function(response) {

			let blob   = '';
			let data   = null;
			let result = null;

			response.setEncoding('utf8');
			response.on('data', chunk => (blob += chunk));
			response.on('end', _ => {

				try {
					data = JSON.parse(blob);
				} catch (err) {
				}

				if (data instanceof Object) {
					result = data.url;
				}

				callback(result);

			});

		});

		request.on('error',   err => callback(null));
		request.on('timeout', err => callback(null));

		request.setTimeout(10000);
		request.write(json);
		request.end();

	};


	return function(args, filters) {

		let remotes = GIT_WORK.remotes.filter(remote => {
			return (filters.remote === null || filters.remote === remote.id);
		});

		if (remotes.length > 0) {

			let title   = filters.title   || null;
			let comment = filters.comment || '';

			if (title !== null) {

				console.log('Creating issue for remote "' + remotes[0].id + '" ...');

				_create_issue(remotes[0], {
					title: title,
					body:  comment
				}, result => {

					if (result !== null) {
						console.info('Success');
						console.info('Issue URL: "' + result + '"');
					} else {
						console.error('GitHub API Error');
					}

				});

			}

		}

	};

})(typeof global !== 'undefined' ? global : this, process.cwd());


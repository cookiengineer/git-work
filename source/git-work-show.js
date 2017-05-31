
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


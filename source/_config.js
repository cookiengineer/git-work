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


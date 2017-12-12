

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
			console.info('git work v2017.12.12');
			console.log('');

			if (GIT_WORK.token !== null) {
				console.info('TOKEN: ' + GIT_WORK.token);
			} else {
				console.error('TOKEN: No token found in "' + cwd + '/.github/TOKEN');
			}

			console.log('');
			console.log('Usage: git work [action] [filters]');
			console.log('');
			console.log('');
			console.log('Available Actions:');
			console.log('');
			console.log('    create            creates an issue');
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
			console.log('    git work create --title="New issue" --comment="Plz work on thiz"');
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



(function(global, argv) {

	let args   = Array.from(argv).filter(v => !v.startsWith('--'));
	let action = argv.find(v => /^(create|sync|show)$/g.test(v));

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


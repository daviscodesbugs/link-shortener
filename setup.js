const DB_PATH = './links.db';

const fs = require('fs');
const inquirer = require('inquirer');
const sqlite = require('sqlite3');
const db = new sqlite.Database(DB_PATH);

let query = "CREATE TABLE `links` ( `id` TEXT NOT NULL UNIQUE, `redirect_url` TEXT NOT NULL UNIQUE, `click_count` INTEGER NOT NULL, PRIMARY KEY(`id`) );";

if (fs.existsSync(DB_PATH)) {
	inquirer.prompt([{
		type: 'confirm',
		name: 'proceed',
		message: 'Running setup will delete your existing database. Proceed?'
	}]).then((answers) => {
		if (answers.proceed) {
			db.serialize(() => {
				db.run("DELETE FROM links;", (err, res) => {
					if (err) throw err;
					db.close();
				});
			});
		} else { process.exit(); }
	});
} else {
	fs.closeSync(fs.openSync(DB_PATH, 'w'));
	db.serialize(() => {
		db.run(query, (err, res) => {
			if (err) throw err;
			db.close();
		});
	});
}

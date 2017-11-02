'use strict';

const Hapi = require('hapi');
const Boom = require('boom');
const sqlite = require('sqlite3');
const randomstring = require('randomstring');
const whilst = require('async').whilst;

const db = new sqlite.Database('./links.db');
const server = new Hapi.Server();
server.connection({
	port: 5270,
	host: "0.0.0.0",
	routes: {
		cors: true
	}
});

server.route({
	method: 'GET',
	path: '/',
	handler: (req, reply) => {
		db.serialize(() => {
			db.all('SELECT * FROM links;', (err, res) => {
				if (err) throw err;
				return reply(res);
			});
		});
	}
});

server.route({
    method: 'GET',
    path: '/{id}',
    handler: (req, reply) => {
		db.serialize(() => {
			db.get('SELECT * FROM links WHERE id = ?;', req.params.id, (err, res) => {
				if (err || !res) return reply(Boom.notFound('Cannot find the requested page'));
				else {
					db.run('UPDATE links SET click_count = click_count + 1 WHERE id = ?;', req.params.id,
						(err, res) => { if (err) throw err; }
					);
					console.log(res.id, "->", res.redirect_url);
					return reply.redirect(res.redirect_url);
				}
			});
		});
    }
});

server.route({
	method: 'POST',
	path: '/',
	handler: (req, reply) => {
		db.serialize(() => {
			let exists = true;
			whilst(
				() => { return exists; },
				(cb) => {
					let hash = randomstring.generate({
					  length: 4,
					  charset: 'alphanumeric'
					});
					db.get('SELECT * FROM links WHERE id = ?;', hash, (err, res) => {
						if (err) throw err;
						if (!res) exists = false;
						cb(null, hash);
					});
				},
				(err, hash) => {
					if (err) throw err;
					db.run('INSERT INTO links VALUES (?, ?, 0);', hash, req.payload.url, (err, res) => {
						if (err && err.errno == 19) {
							db.get('SELECT * FROM links WHERE redirect_url = ?;', req.payload.url, (err, res) => {
								console.log(req.payload.url, "->", res.id);
								return reply(res.id);
							});
						} else if (err) {
							throw err;
						} else {
							console.log(req.payload.url, "->", hash);
							return reply(hash);
						}
					});
				}
			);
		});
	}
});

server.start((err) => {
    if (err) throw err;
    console.log(`Server running at: ${server.info.uri}`);

	process.on('SIGINT', () => {
		console.log("\nStopping server...");
		db.close();
		process.exit();
	});
});

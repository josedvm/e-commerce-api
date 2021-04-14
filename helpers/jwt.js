const expressJwt = require("express-jwt");

function authJwt() {
	const secret = process.env.secret;
	const api = process.env.API_URL;
	return expressJwt({
		secret,
		algorithms: ["HS256"],
		isRevoked: isRevoked, // funcion que revoca el token por condiciones dadas
	}).unless({
		// se excluyen las tutas que no necesitan autorizacion de token
		path: [
			{ url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
			{ url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
			{ url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
			`${api}/users/login`,
			`${api}/users/register`,
		],
	});
}

const isRevoked = async (req, payload, done) => {
	console.log(`el usuario es admin? : ${payload.isAdmin}`);
	!payload.isAdmin
		? done(null, true) //rechazar token
		: done();
};

module.exports = authJwt;

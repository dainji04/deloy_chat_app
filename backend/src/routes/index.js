const auth = require('./auth.route.js');
const user = require('./user.route.js');
const message = require('./message.route.js');
const friend = require('./friend.route.js');
const group = require('./group.route.js');
const background = require('./background.route.js');

function route(app) {
    app.use('/api/auth', auth);

    app.use('/api/user', user);

    app.use('/api/messages', message);

    app.use('/api/friends', friend);

    app.use('/api/groups', group);

    app.use('/api/backgrounds', background);

    app.get('/', (req, res) => {
        res.send('Hello World from routes!');
    });
}

module.exports = route;

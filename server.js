require('dotenv').config();
var express = require('express');
var exphbs = require('express-handlebars');
var path = require('path');

var db = require('./models');
var initData = require('./basedata/init');

var app = express();
var PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars
app.engine(
    'handlebars',
    exphbs({
        defaultLayout: 'main'
    })
);
app.set('view engine', 'handlebars');

// Routes
require('./routes/apiRoutes')(app);
require('./routes/locationRoutes')(app);
require('./routes/htmlRoutes')(app);

var syncOptions = { force: false };

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === 'test') {
    syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize
    .sync(syncOptions)
    .then(() => initData(db))
    .then(() => {
        app.listen(PORT, function() {
            console.log(
                '==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.',
                PORT,
                PORT
            );
        });
    })
    .catch(err => {
        console.log('ERROR STARTING SERVER:');
        console.log(err);
        process.exit();
    });

module.exports = app;

var restify = require('restify');
var builder = require('botbuilder');

// Create bot
// var connector = new builder.ChatConnector({
//     appId: process.env.MICROSOFT_APP_ID,
//     appPassword: process.env.MICROSOFT_APP_PASSWORD
// });
// var bot = new builder.UniversalBot(connector);

// var bot = new builder.BotConnectorBot(botConnectorOptions);
// bot.add('/', function (session) {

//     //respond with user's message
//     session.send("You said " + session.message.text);
// });


var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

//var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);

bot.dialog('/', function (session) {
    session.send("%s, I heard: %s", session.userData.name, session.message.text);
    session.send("Say something else...");
});

// Install First Run middleware and dialog
bot.use(builder.Middleware.firstRun({ version: 1.0, dialogId: '*:/firstRun' }));
bot.dialog('/firstRun', [
    function (session) {
        builder.Prompts.text(session, "Hello... What's your name?");
    },
    function (session, results) {
        // We'll save the users name and send them an initial greeting. All
        // future messages from the user will be routed to the root dialog.
        session.userData.name = results.response;
        session.endDialog("Hi %s, say something to me and I'll echo it back.", session.userData.name);
    }
]);

// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
//server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.post('/api/messages', connector.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

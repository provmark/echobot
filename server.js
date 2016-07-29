var restify = require('restify');
var builder = require('botbuilder');

// Get secrets from server environment
var botConnectorOptions = {
    appId: process.env.BOTFRAMEWORK_APPID,
    appSecret: process.env.BOTFRAMEWORK_APPSECRET
};

// Create bot
var bot = new builder.BotConnectorBot(botConnectorOptions);
// bot.add('/', function (session) {

//     //respond with user's message
//     session.send("You said " + session.message.text);
// });



/* ---------------------------------Root Dialog---------------------------------- */

bot.dialog("/", [

  // Have user fill out profile.
  function(session, args, next) {
    if ( unfinishedProfile(session) ) {
      session.send("Before we start, I'll ask you a few questions.");
      session.beginDialog("/profile");
    } else {
      next();
    }
  },


  // Confirmation Loop
  function(session) {
      session.beginDialog("/confirm");
  },


  // Ask what's wrong (input for Decision Tree)
  function(session) {
    var name = session.userData.name;
    builder.Prompts.text(session, "\nThank you! Alright, " + name + ", what can I do for you?");
  },


  // Analyze input to begin decision tree
  function(session, results) {
    beginDecisionTree(results.response);
  }

]);

/* ---------------------------------Profile Dialog------------------------------- */

bot.dialog("/profile", [

  // Name
  function(session) {
    session.beginDialog("/name");
  },

  // Date of Birth
  function(session) {
    session.beginDialog("/dob");
  },

  // Body Weight
  function(session) {
    session.beginDialog("/bodyweight");
  },

  // Email Address
  function(session) {
    session.beginDialog("/email");
  },

  // Phone Number
  function(session) {
    session.beginDialog("/phone");
  },

]);


/* ~~~~~~ Name Sub-Dialog ~~~~~ */
bot.dialog("/name", [

  function(session) {
    builder.Prompts.text(session, "What's your name?");
  },

  function(session, results) {
    session.userData.name = results.response;
    session.endDialog();
  }

]);

/* ~~~~~~Date of Birth Sub-Dialog~~~~~~ */
bot.dialog("/dob", [

  function(session) {
    builder.Prompts.text(session, "What's your date of birth?");
  },

  function(session, results) {
    session.userData.dob = results.response;
    session.endDialog();
  }

]);

/* ~~~~~~~Body Weight Sub-Dialog~~~~~~*/
bot.dialog("/bodyweight", [

  function(session) {
    builder.Prompts.number(session, "What's your body weight (lbs)?");
  },

  function(session, results) {
    session.userData.weight = results.response;
    session.endDialog();
  }

]);

/* ~~~~~~~~Email Sub-Dialog~~~~~~~ */
bot.dialog("/email", [

  function(session) {
    builder.Prompts.text(session, "What's your email address?");
  },

  function(session, results) {
    session.userData.email = results.response;
    session.endDialog();
  }

]);

/* ~~~~~~~~~~Phone Sub-Dialog~~~~~~~~ */
bot.dialog("/phone", [

  function(session) {
    builder.Prompts.text(session, "What's your phone number?");
  },

  function(session, results) {
    session.userData.phone = results.response;
    session.endDialog();
  }

]);




/* ---------------------------------Confirmation Dialog----------------------------------- */
bot.dialog("/confirm", [

  // Confirmation Message
  function(session) {
    session.send("\n\n Please confirm the following: \n");

    var userInfoStr = "";

    userInfoStr += "Name: " + session.userData.name + "\n";
    userInfoStr += "Date of Birth: " + session.userData.dob + "\n";
    userInfoStr += "Weight: " + session.userData.weight + "\n";
    userInfoStr += "Email: " + session.userData.email + "\n";
    userInfoStr += "Phone: " + session.userData.phone + "\n";

    session.send(userInfoStr); // Print to console.

    builder.Prompts.text(session, "To change any info, Enter the Field Name. Or hit ENTER to confirm.");
  },

  // Decision Tree
  function(session, results, next) {
    switch( results.response.toUpperCase() ) {
      case "NAME":
        session.beginDialog("/name");
        break;
      case "DATE OF BIRTH":
        session.beginDialog("/dob");
        break;
      case "WEIGHT":
        session.beginDialog("/bodyweight");
        break;
      case "EMAIL":
        session.beginDialog("/email");
        break;
      case "PHONE":
        session.beginDialog("/phone");
        break;
      case "":
        session.userData.finishedProfile = true;
        session.endDialog();
        break;

      default:
        session.send("\n\n\nI'm sorry, I didn't understand that.");
        next();
    }
  },

  function(session) {
    session.beginDialog("/confirm");
  }

]);

/* ----------------------------------------Helper Functions---------------------------------------------- */

function unfinishedProfile(session) {
  if ( !session.userData.finishedProfile ) {
    return true;
  } else {
    return false;
  }
}





// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

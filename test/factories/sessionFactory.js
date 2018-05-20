const Buffer = require('safe-buffer').Buffer; //Buffer library to create base64 session string
const Keygrip = require('keygrip');
const keys = require('../../config/keys'); //Has cookie key depending on environment we are in
const keygrip = new Keygrip([keys.cookieKey]); //keygrip to create the instance of keygrip with the cookie secret key

module.exports = user => {
  const sessionObject = {
    //Session object requried to be converted into base64 session string
    passport: {
      user: user._id.toString() //Need this since mongoose gives you a JS object need to turn it into a string first
    }
  };

  const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64'); //Turn JS object into JSON and then use Buffer library and finally turn it into a string

  //Need to also provide sessionSig with keygrip
  const sig = keygrip.sign('session=' + session); //Creating the session signature to verify the session string

  return { session, sig };
};

const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get); //returns a promisifcation of client.get, since client.get originally has an error first call back

const exec = mongoose.Query.prototype.exec; //Reference to the original exec function

mongoose.Query.prototype.exec = async function() {
  console.log('Im about to run a query');

  // console.log(this.getQuery()); Grabs the query object
  // console.log(this.mongooseCollection.name); Grabs the collection being queried

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );
  // console.log(key);
  //Object.assign use to safely copy properties from one object to another
  //First arg is the object were going to copy a bunch of properties to, so the results
  //of getQuery will be assigned to the empty object, the second object will also be copied on as well

  //See if we have a value for 'key' in redis
  const cacheValue = await client.get(key);

  //If we do, return that
  if (cacheValue) {
    const doc = JSON.parse(
      cacheValue
    ); /* Same as doing new Blog({title: 'hi', content: 'there'})*/

    //Checks if theres a cached value and then return the mongoose obj version

    return Array.isArray(doc)
      ? doc.map(d => {
          return new this.model(d);
        })
      : new this.model(doc);
    // console.log('cache', cacheValue);
  }

  //Otherwise, issue the query and store the result in redis

  const result = await exec.apply(this, arguments); //Exececute the original pristin prototype exec function from above (runs the query)
  // console.log('result', result); we see here that result is a mongoose model object
  //So we need to turn it into JSON to work with redis

  client.set(key, JSON.stringify(result)); //This will set JSON version of that mongoose model object to the key
  //This also now saves a cached version with the key and value in redis to be retrieved next time
  return result; //Returns the result
};

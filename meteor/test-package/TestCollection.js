const {Mongo} = require("meteor/mongo");

const TestCollection = new Mongo.Collection('test.collection');
module.exports = TestCollection;

//if Meteor.isClient
//  throw new Error 'Uncaught client side error before tests.'

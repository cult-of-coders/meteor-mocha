// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const {Mongo} = require("meteor/mongo");

const TestCollection = new Mongo.Collection('test.collection');
export default TestCollection;

//if Meteor.isClient
//  throw new Error 'Uncaught client side error before tests.'

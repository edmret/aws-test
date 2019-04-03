'use strict';

const AWS = require('aws-sdk');

const region = 'us-east-1';

var sqs = new AWS.SQS({region: region});

const AWS_ACCOUNT = process.env.ACCOUNT_ID;
//const QUEUE_URL = `https://sqs.${region}.amazonaws.com/${AWS_ACCOUNT}/MyQueue`;
const QUEUE_URL = `https://sqs.us-east-1.amazonaws.com/928410696171/MyQueue`;

module.exports.hello = async (event, context, callback) => {

  let response = {};

  //console.log(event, context, callback);

  const params = {
    MessageBody: 'Hola',
    QueueUrl: QUEUE_URL
  };

  console.log('before the storm', params);
  try{
    sqs.sendMessage(params, function(err, data) {

      console.log('has error?', err);
      if(err){
        console.log('error', 'message cannot be sent: ' + err);
        response = {
          statusCode: 500,
          body: JSON.stringify({
            message: err
          })
        };
      }else{
        console.log('data: ', data);
        response = {
          statusCode: 200,
          body: JSON.stringify({
            message: data
          })
        };
      }
      callback( response);
  
    });
  }catch(err){
    console.log('error Vergas', err);
  }
  

  

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.sqsHello = async (event, context) => {
  console.log('sqs hello called');
  console.log(event);

  context.done(null, '');
};

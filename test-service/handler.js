'use strict';

const AWS = require('aws-sdk');
const _manager = require('./databaseManager');
const uuidv1 = require('uuid/v1');

const region = 'us-east-1';

var sqs = new AWS.SQS();
const ses = new AWS.SES();

const AWS_ACCOUNT = process.env.ACCOUNT_ID;
const QUEUE_URL = `https://sqs.${region}.amazonaws.com/${AWS_ACCOUNT}/MyQueue`;
//const QUEUE_URL = `https://sqs.us-east-1.amazonaws.com/928410696171/MyQueue`;

module.exports.hello = (event, context, callback) => {

  let response = {};


  //console.log(event, context, callback);

  const params = {
    MessageBody: 'Hola',
    QueueUrl: QUEUE_URL
  };

  console.log('before the storm', params);
  try{
    sqs.sendMessage(params, function(err, data) {
      
      if(err){
        console.log('error', 'message cannot be sent: ' + err);
        response = response = createResponse(500, err);;
      }else{
        console.log('data: ', data);
        response = createResponse(200, data);
      }
      callback(null, response);
  
    });

  }catch(err){
    console.log('error Vergas', JSON.stringify(err) );
  }
  

  

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.sqsHello = async (event, context) => {
  console.log('sqs hello called');
  console.log(event.Records.map(r=> r.body));

  context.done(null, '');
};

module.exports.saveItem = async (event, context, callback) => {
  const item = JSON.parse(event.body);
  console.log(item);
  item.itemId = uuidv1();

  return _manager.saveItem(item).then( response => {
    console.log(response);
    return createResponse(200, response);
  }).catch(error=>{
    console.log ('save failed', error);
    return createResponse(500, error);
  });
};

module.exports.getItem = async (event) => {
  const itemId = event.pathParameters.itemId;

  console.log('item id: ',itemId);

  return _manager.getItem(itemId).then(response => {
    console.log(response);
    return createResponse(200, response);
  });
};

module.exports.deleteItem = async (event) => {
  const itemId = event.pathParameters.itemId;

  return _manager.deleteItem(itemId).then(response => {
    console.log(response);
    return createResponse(200, 'deleted Item');
  });
};

module.exports.updateItem = async (event) => {
  const itemId = event.pathParameters.itemId;

  const body = JSON.parse(event.body);
  const paramName = body.paramName;
  const paramValue = body.paramValue;

  console.log(body, paramName, paramValue);

  return _manager.updateItem(itemId, paramName, paramValue).then(response => {
    console.log(response);
    return createResponse(200, response);
  });
};

module.exports.getAll = async() => {
  return _manager.getAllItems().then(response => {
    console.log(response);
    return createResponse(200, response);
  });
}

module.exports.sendEmail = async() => {
  const sender = "AWS Retama <edmundo.martinez@ipointsystems.com>";
  const recipient = "edmret@gmail.com";

  const subject = "Amazon AWS";

  const body_html = `
    this is the test EMail
  `;

  const charset = "UTF-8";

  const params = {
    Source: sender,
    Destination: {
      ToAddresses: [
        recipient
      ]
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: charset
      },
      Body: {
        Text: {
          Data: body_html,
          Charset: charset
        }
      }
    }
  };

  await ses.sendEmail(params)
    .promise()
    .then(data=> console.log('email Sent', data))
    .catch(err => console.log('error-ocurred', err));

  return createResponse(200, 'email sent');
};



function createResponse(statusCode, message){
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(message)
  };
};
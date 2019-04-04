'use strict';

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.ITEMS_DYNAMODB_TABLE;

module.exports.saveItem = item => {
    const params= {
        TableName: TABLE_NAME,
        Item: item
    };

    return dynamo.put(params).promise().then(() => {
        return item.itemId;
    });
};

module.exports.getItem = itemId => {
    const params= {
        TableName: TABLE_NAME,
        Key: {
            itemId: itemId
        }
    };

    console.log('params to send', params);
    return dynamo.get(params).promise().then( result => {
        console.log('getResult', result);
        return result.Item;
    })
};

module.exports.deleteItem = itemId => {
    const params= {
        TableName: TABLE_NAME,
        Key: {
            itemId: itemId
        }
    };

    return dynamo.delete(params).promise();
};

module.exports.updateItem = (itemId, paramsName, paramsValue) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            itemId: itemId
        },
        ConditionExpression: `attribute_exists(itemId)`,
        UpdateExpression: 'set ' + paramsName + ' = :v',
        ExpressionAttributeValues: {
            ':v' : paramsValue
        },
        ReturnValues: 'ALL_NEW'
    };

    return dynamo.update(params).promise().then( response => {
        return response.Attributes
    });
};
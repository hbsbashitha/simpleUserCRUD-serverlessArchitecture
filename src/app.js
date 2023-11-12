const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = "users_table";

exports.getUsersHandler = async (event) => {
    let response;

    try {
        // Specify the attribute and value for the filter condition
        const filterAttribute = 'security_status';
        const filterValue = 'active';

        // Use the DocumentClient to get all items in the table
        const data = await dynamoDb.scan({
            TableName: tableName,
            FilterExpression: `${filterAttribute} = :value`,
            ExpressionAttributeValues: {
                ':value': filterValue,
            },
        }).promise();

        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Data fetched from DynamoDB',
                date: data.Items,
            }),
        };
    } catch (err) {
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: err instanceof Error ? err.message : 'Some error happened',
            }),
        };
    }

    return response;
};

exports.createUserHandler = async (event) => {
    let response;

    try {
        // Parse the incoming event data, assuming it's in JSON format
        const requestData = JSON.parse(event.body);

        // Create an item to be saved in the DynamoDB table
        const params = {
            TableName: tableName,
            Item: {
                ...requestData,
                security_status: 'active'
            }
        };

        await dynamoDb.put(params).promise();
        const createdUser = await dynamoDb.get({
            TableName: tableName,
            Key: {
                id: requestData.id,
            },
        }).promise();

        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Data saved to DynamoDB',
                date: createdUser.Item
            }),
        };
    } catch (err) {
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: err instanceof Error ? err.message : 'Some error happened',
            }),
        };
    }

    return response;
}

exports.updateUserHandler = async (event) => {
    let response;

    try {
        const updatedData = JSON.parse(event.body);
        const id = event.pathParameters.id;

        const params = {
            TableName: tableName,
            Key: {
                id: id
            },
            UpdateExpression: 'SET #data = :updatedData',
            ExpressionAttributeNames: { '#data': 'name' },
            ExpressionAttributeValues: {
                ':updatedData': updatedData.name,
            },
            ReturnValues: 'ALL_NEW', // Optional, returns the updated item

        };

        // Use the DocumentClient to put the item in the DynamoDB table
        const data = await dynamoDb.update(params).promise();

        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Data updated to DynamoDB',
                data: data.Attributes
            }),
        };
    } catch (err) {
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: err instanceof Error ? err.message : 'Some error happened',
            }),
        };
    }

    return response;
}

exports.deleteUserHandler = async (event) => {
    let response;

    try {
        const id = event.pathParameters.id;

        const params = {
            TableName: tableName,
            Key: {
                id: id
            },
            UpdateExpression: 'SET #data = :value',
            ExpressionAttributeNames: { '#data': 'security_status' },
            ExpressionAttributeValues: {
                ':value': 'inactive',
            },
            ReturnValues: 'ALL_NEW', // Optional, returns the updated item
        };

        // Use the DocumentClient to put the item in the DynamoDB table
        const data = await dynamoDb.update(params).promise();

        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Data deleted from DynamoDB',
                data: data.Attributes
            }),
        };
    } catch (err) {
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: err instanceof Error ? err.message : 'Some error happened',
            }),
        };
    }

    return response;
}
const uuid = require('uuid');
const AWS = require("aws-sdk");
const Joi = require('@hapi/joi');
const decoratorValidator = require('../util/decoratorValidator');
const globalEnum = require('../util/globalEnum');
class Handler {

    constructor({dynamoDbService}){
        this.dynamoDbService = dynamoDbService;
        this.dynamoDbTable = process.env.DYNAMODB_TABLE
    }
    static validator(){
        return Joi.object({
            name: Joi.string().max(100).min(2).required(),
            skill: Joi.string().max(20).required()
        })
    }
    prepareData(data){
        const params ={
            TableName: this.dynamoDbTable,
            Item:{
                ...data,
                id:uuid.v1(),
                createdAt: new Date().toISOString()
            }
        }
        return params;
    }
    async insertItem(params){
        return this.dynamoDbService.put(params).promise();
    }
    handleSuccess(data){
        const response = {
            statusCode: 200,
            body: JSON.stringify(data)
        }
        return response;
    }
    handleError(data) {
        const response = {
            statusCode: data.statusCode || 501,
            body:'Couldn\'t create item',
            headers:{'Content-Type':'text/plain'}
        }
        return response;
    }
    async main(event){
        try {
            //the decorator is responsible for JSON.parsing
            const data = event.body;
            const dbParams = this.prepareData(data);
            await this.insertItem(dbParams);
            return this.handleSuccess(dbParams.Item);
        } catch (error) {
            console.log(error.stack);
           return this.handleError({statusCode: 500});
    }
}
}

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const handler = new Handler(
   { dynamoDbService: dynamoDB}
);
module.exports =decoratorValidator(
    handler.main.bind(handler),
    Handler.validator(),
     globalEnum.ARG_TYPE.BODY
     );
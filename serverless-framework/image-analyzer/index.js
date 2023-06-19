"use strict"
const {promises: {readFile}} = require("fs");
class Handler{
  constructor({rekognitionService}){
    this.rekognitionService = rekognitionService;
  }
  async detectImageLabels(buffer){
    const result = await this.rekognitionService.detectLabels({
      Image:{
        Bytes: buffer
      }
    }).promise();

    const filteredResults = result.Labels.filter(({ Confidence }) => (Confidence > 90));
    const names = filteredResults.map(({Name})=>Name).join(" and ");
    return { names, filteredResults};
  }
  async main (event){
    try {
      const imageBuffer = await readFile("./images/dog.jpg");
      const { names, filteredResults } = await this.detectImageLabels(imageBuffer);
      console.log({names, filteredResults});
      return {
        statusCode: 200,
        body: "Hello"
      }
    } catch (error) {
      console.error("Error***", error.stack)
      return {
        statusCode: 500,
        body: "Internal Server Error"
      }

    }
  }
}
const aws = require("aws-sdk");
const rekognition = new aws.Rekognition();
const handler = new Handler({
  rekognitionService : rekognition
});
module.exports.main = handler.main.bind(handler);
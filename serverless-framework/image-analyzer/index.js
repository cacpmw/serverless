"use strict"
const {get}  = require("axios");
class Handler{
  constructor({rekognitionService, translatorService}){
    this.rekognitionService = rekognitionService;
    this.translatorService = translatorService;
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
  async translateText(text){
    const params={
      SourceLanguageCode:"en",
      TargetLanguageCode: "pt",
      Text: text
    };
    const {TranslatedText} = await this.translatorService.translateText(params).promise();
    console.log(JSON.stringify(TranslatedText));
    return TranslatedText.split(" e ");
  }

  formatTextResults(texts, filteredResults){
    const finaltext = [];
    for(const indexText in texts){
      const nameInPortuguese = texts[indexText];
      const confidence = filteredResults[indexText].Confidence;
      finaltext.push(`${confidence.toFixed(2)}% de ser do tipo ${nameInPortuguese}`)
    }
    return finaltext.join("\n");
  }
  async getImageBuffer(imageUrl){
      const response = await get(imageUrl,{
        responseType: "arraybuffer"
      });
      const buffer = Buffer.from(response.data,"base64");
      return buffer;
  }
  async main (event){
    try {
      const {imageUrl} = event.queryStringParameters;
      //const imageBuffer = await readFile("./images/dog.jpg");
      console.log("Downloading...");
      const buffer = await this.getImageBuffer(imageUrl)
      console.log("Labels...");

      const { names, filteredResults } = await this.detectImageLabels(buffer);

      console.log("Translating...");
      const texts = await this.translateText(names);

      console.log("Handling final object...");
      const finalObject = this.formatTextResults(texts, filteredResults);

      return {
        statusCode: 200,
        body: `A imagem tem \n`.concat(finalObject)
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
const translator = new aws.Translate();
const handler = new Handler({
  rekognitionService : rekognition,
  translatorService: translator
});
module.exports.main = handler.main.bind(handler);
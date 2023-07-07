const handler = {
    async main(event){
        console.log("event", JSON.stringify(event, null,2));
        return {statusCode: 200};
    }
}

module.exports = handler.main.bind(handler);
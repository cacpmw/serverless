const decoratorValidator = (fn, schema, argsType)=>{
    return async function (event){
        console.log(event);
       const data = JSON.parse(event[argsType])
       //abortEarly shows all error at once
        const { error, value } = await schema.validate(
            data, {abortEarly: false}
        );
        //changes arguments instance
        event[argsType] = value
        //arguments get all arguments passed to this function (event) and pass it along
        //.apply executes the function with a given this value and the arguments
       if(!error) return fn.apply(this, arguments);
       return {
        statusCode:422, //unprocessable entity
        body: error.message
       }
    }
}

module.exports = decoratorValidator
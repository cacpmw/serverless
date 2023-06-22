#create role
aws iam create-role \
    --role-name lambda-exmplo \
    --assume-role-policy-document file://policies.json \
    | tee logs/role.log

#delete role
aws iam delete-role \
    --role-name lambda-exmplo
#create lambda function
aws lambda create-function \
    --function-name hello-cli \
    --zip-file fileb://function.zip \
    --handler index.handler \
    --runtime nodejs18.x \
    --role arn:aws:iam::854851610188:role/lambda-exmplo \
    | tee logs/lambda-creation.log

#delete lambda function
aws lambda delete-function \
    --function-name hello-cli
#invoke lambda function
aws lambda invoke \
    --function-name hello-cli \
    --log-type Tail \
    logs/lambda-execution.log

#update lambda function
aws lambda update-function-code \
    --function-name hello-cli \
    --zip-file fileb://function.zip \
    --publish \
    | tee logs/lambda-update.log
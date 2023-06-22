# install
npm install -g serverless

#initialize
sls

#deploy
sls deploy

#invoke on aws
sls invoke -f <function name>

#invoke local
sls invoke local -f <function name> -l

#logs
sls logs -f <function Name> -t
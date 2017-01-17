const request = require('request-promise')

//request options
function options(screenname) {
  let options = { method: 'POST',
  url: 'https://app.receptiviti.com/v2/api/import/twitter/user',
  headers:
   { 'postman-token': 'f7709fd5-462e-abb9-9a16-2bf78301be37',
     'cache-control': 'no-cache',
     'x-api-secret-key': 'pufoerD5nYKA1F7dBtqsDhe98JRUiQPm5w9L7BkO2CM',
     'x-api-key': '587e8da9ddf37305920b849a',
     'content-type': 'application/json' },
  json: true };

  options.body = { screen_name: screenname }

  return options
}



request(options('realDonaldTrump'), function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});


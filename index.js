const request = require('request-promise')
const parse = require('csv-parse')
const fs = require('fs')

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

//csv parse function
const parser = parse({delimter: ':'}, function(err,data){
  let people = parse_people(data)
  fetch_receptivity(people)
})

//reading the data csv file
fs.createReadStream(__dirname+'/data.csv')
  .pipe(parser)

function parse_people(data){
  let people = [];
  data.forEach(person => people.push({name: person[0],
            twitter:person[6].substring(person[6].lastIndexOf("/")+1)}))
  return people
}

function fetch_receptivity(people){
  let fetches = []
  people.forEach(person => fetches.push(request(options(person.twitter))))

  Promise.all(fetches).then(values => {
    let result = [];
    for(let i = 0; i<people.length;i++){
      result.push({name: people[i], data: values[i]})
    }
    return result;
  })
  .then(data => console.log(data))
}

/*
request(options('realDonaldTrump'), function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});

*/

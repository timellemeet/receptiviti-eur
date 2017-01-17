const request = require('request-promise')
const parse = require('csv-parse')
const fs = require('fs')

//request options
function create_request_options(screenname) {
  let options = { method: 'POST',
  url: 'https://app.receptiviti.com/v2/api/import/twitter/user',
  headers:
   {
     'cache-control': 'no-cache',
     'x-api-secret-key': 'I0ICSjb8LasMgHgj9X96tEzJgkifi1zsprAuhAG2cZE',
     'x-api-key': '58739637412cee05ed8fd5d8',
     'content-type': 'application/json' },
  json: true };

  options.body = { screen_name: screenname }

  return options
}

//request options
function get_finished_options(operationid) {
  return options = { method: 'GET',
  url: 'https://app.receptiviti.com/v2/api/import/twitter/requests/'+operationid+'/people',
  headers:
   {
     'cache-control': 'no-cache',
     'x-api-secret-key': 'I0ICSjb8LasMgHgj9X96tEzJgkifi1zsprAuhAG2cZE',
     'x-api-key': '58739637412cee05ed8fd5d8',
     'content-type': 'application/json' },
  json: true };
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
  people.forEach(person => fetches.push(request(create_request_options(person.twitter))))

  Promise.all(fetches).then(values => {
    let result = [];
    for(let i = 0; i<people.length;i++){
      result.push({name: people[i], data: values[i]})
    }
    return result;
  })
  .then(data => console.log(data))
}


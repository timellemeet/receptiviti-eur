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
  let options = { method: 'GET',
  url: 'https://app.receptiviti.com/v2/api/import/twitter/requests/'+operationid+'/people',
  headers:
   {
     'cache-control': 'no-cache',
     'x-api-secret-key': 'I0ICSjb8LasMgHgj9X96tEzJgkifi1zsprAuhAG2cZE',
     'x-api-key': '58739637412cee05ed8fd5d8',
     'content-type': 'application/json' },
  json: true };
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
  people.forEach(person => fetches.push(request(create_request_options(person.twitter))))

  return Promise.all(fetches).then(values => {
    let result = [];
    let x = 0
    for(let i = 0; i<people.length;i++){
      if(values[i].status == "Finished"){
        x++;
        result.push({name: people[i].name, id: values[i]._id})
      }

    }

    console.log('percentage fetched: '+(x/people.length*100)+'%')
    return result;
  })
  .then(people => {
    let fetches = []
    people.forEach(person => fetches.push(request(get_finished_options(person.id))))

    return Promise.all(fetches).then(data => {
      let result = []
      for(let i = 0; i<data.length;i++){
        result.push({name:people[i].name, data: data[i][0]})
      }
      return result
    })
  })
  .then(result => {
    fs.writeFile('./result.json', JSON.stringify(result, null, 2), 'utf-8')
  })
}





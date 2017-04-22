const request = require('requestretry')
const parse = require('csv-parse')
const fs = require('fs')

//request options
function create_request_options(screenname) {
  let options = { method: 'POST',
  url: 'https://app.receptiviti.com/v2/api/import/twitter/user',
  fullResponse: false,
  maxAttempts: 5, // (default) try 5 times
  retryDelay: 2000, // (default) wait for 5s before trying again
  headers:
   {
     'cache-control': 'no-cache',
     'x-api-secret-key': 'HCmkt9cgY5E3mOuf8awmxOwPeQpSkXz0xcsyBOqh96w',
     'x-api-key': '58fa9a6196b0b5059c7bdc1a',
     'content-type': 'application/json' },
  json: true };

  options.body = { screen_name: screenname }

  return options
}

//request options
function get_finished_options(operationid) {
  let options = { method: 'GET',
  url: 'https://app.receptiviti.com/v2/api/import/twitter/requests/'+operationid+'/people',
  fullResponse: false,
  maxAttempts: 5, // (default) try 5 times
  retryDelay: 2000, // (default) wait for 5s before trying again
  headers:
   {
     'cache-control': 'no-cache',
     'x-api-secret-key': 'HCmkt9cgY5E3mOuf8awmxOwPeQpSkXz0xcsyBOqh96w',
     'x-api-key': '58fa9a6196b0b5059c7bdc1a',
     'content-type': 'application/json' },
  json: true };
  return options
}

//csv parse function
const parser = parse( function(err,data){
  console.log(data)
  let people = parse_people(data)
  fetch_receptivity(people)
})

//reading the data csv file
fs.createReadStream(__dirname+'/data.csv')
  .pipe(parser)

//parse people
function parse_people(data){
  console.log(data)
  let people = [];
  data.forEach(person => {
    if(person[12]){
    people.push({name: person[0], twitter:person[12].substring(person[12].lastIndexOf("/")+1)})
  }
  })
  return people
}

function fetch_receptivity(people){

  //request information
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

    console.log('percentage processed by receptiviti: '+(x/people.length*100)+'%')
    console.log('now fetching from '+x+' people')
    return result;
  })
  //fetch the data of processed people
  .then(people => {
    let fetches = []
    people.forEach(person => fetches.push(request(get_finished_options(person.id))))
  console.log(people)
    return Promise.all(fetches).then(data => {
      let result = []
      console.log(data)
      for(let i = 0; i<data.length;i++){
        
        result.push({name:people[i].name, data: data[i][0]})
      }
      return result
    })
  })
  //write to the results.json file
  .then(result => {
    fs.writeFile('./result.json', JSON.stringify(result, null, 2), 'utf-8', err => {
      if(err) reject (err);
      else console.log('done')
    })
  })
}





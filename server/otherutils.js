const csv = require('csv-parser');
const keccak256 = require('keccak256');

function parseData(file) {
    let data = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(file)
          .on('error', error => {
              reject(error);
          })
          .pipe(csv())
          .on('data', (row) => {
            var tokenid = row.tokenid; 
            var tokeninfo = row.tokeninfo;
            var sender = row.sender;
            var infohash = keccak256(tokeninfo).toString('hex');// hash tokeninfo and push to data
            data.push([tokenid, infohash, sender]);
          })
          .on('end', () => {
              resolve(data);
          });
    });
  }
  
async function getData(datapath) {
try { 
    const data = await parseData(datapath);
    return data;
} catch (error) {
    console.error("getData: An error occurred: ", error.message);
}
}

module.exports = {parseData, getData};
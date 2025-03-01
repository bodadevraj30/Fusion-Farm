const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '4621NL76',
  database: 'fusionfarm'
});

function query(sql, args) {
  return new Promise((resolve, reject) => {
    connection.connect(err => {
      if (err) {
        return reject(err);
      }
      connection.query(sql, args, (err, rows) => {
        connection.end(); 
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  });
}

module.exports = {
  query
};

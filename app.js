let express = require('express');
let app = express();
require('dotenv').config();

let morgan = require('morgan');
app.use(morgan('tiny'));

app.use(express.json());

app.use('/homepage', (req, res) => {
  res.send('Welcome to sql & express');
});

// Instantiate database instance and create a connection
let sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('test.db'); // Ideally use env variables: process.env.data_source

// Get all rows from table
app.get('/people', (req, res, next) => {
  let sql = 'select * from names';
  let params = [];

  // returns an array of objects
  db.all(sql, params, (err, rows) => {
    res.json(rows);
  });
});

// return a single row (as an object)
app.get('/people/:first_name/:last_name', (req, res, next) => {
  let sql = 'select * from names where first_name = ? and last_name = ?'; // holds dynamic values
  let params = [req.params.first_name, req.params.last_name];

  db.get(sql, params, (err, row) => {
    res.json(row);
  });
});

// Insert a row
app.post('/people/:first_name/:last_name', (req, res, next) => {
  let sql = `
    INSERT INTO NAMES (first_name, last_name)
    VALUES (?, ?);
  `;

  let params = [req.params.first_name, req.params.last_name];

  db.run(sql, params, function (err) {
    res.json({message: 'successful'});
  });
});

// Insert a row and return it as confirmation
app.post('/people_confirm/:first_name/:last_name', (req, res, next) => {
  let sql = `
    INSERT INTO NAMES (first_name, last_name)
    VALUES (?, ?);
  `;

  let lastRecordSql = `select * from names where rowid = ?`;

  let params = [req.params.first_name, req.params.last_name];

  db.run(sql, params, function (err) {
    if (err) {
      next(err);
    } else {
      db.get(lastRecordSql, [this.lastID], (err, row) => {
        if (err) {
          next(err);
        } else {
          res.json(row);
        }
      });
    }
  });
});

let port = 3000;

app.listen(port, () => console.log('App is listening on port ' + port));

const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql');

var connection = mysql.createConnection({
    host:'54.183.250.217',
    port: '3306',
    user:'rayeon',
    password:'dkssud1',
    database: 'easyfarmDB'
});


connection.connect();   
 

dotenv.config();
const app = express();
app.set('port', process.env.PORT || 3000);

app.use(morgan('dev'));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

const multer = require('multer');
const fs = require('fs');





app.post('/myhouse', (req, res, next) => {
  
    var user = req.getParameter("UserId");
    console.log('gㅎㅎ'+user);
      let sql = 'select * from MyPlant where MyPlant_User_id = "'+req.body.UserId+'";';
      console.log('웅웅'+sql);
      connection.query(sql, function (err, results, fields) {
        if (err) {
          console.log(err);
      }
      console.log(results);
      });
  });
  
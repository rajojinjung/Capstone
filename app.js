const dotenv = require('dotenv');//for 보안
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const mysql = require('mysql');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const fs = require('fs');
//DB 연결
var connection = mysql.createConnection({
    host:'3.101.38.25',
    port: '3306',
    user:'rayeon0418',
    password:'dkssud1',
    database: 'easyfarmDB'
});
connection.connect();   

 
//연결 여부 확인
connection.query("select * from User;", function (err, results, fields) {
    if (err) {
        console.log(err);
    }
    console.log(results);
});

dotenv.config();


const app = express();
app.set('port', process.env.PORT || 3000);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
//app.use('/',indexRouter);
//app.use('/uploadPest',postPestRouter);
//app.use('/', express.static(path.join(__dirname, 'public')));


//app.use(cookieParser(process.env.COOKIE_SECRET));


const { runInNewContext } = require('vm');

//const s3=new AWS.S3();
AWS.config.update({//s3연결
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2',
});

const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: 'capstoneeasyfarm',
    key(req, file, cb) {
      cb(null, `image/${Date.now()}${path.basename(file.originalname)}`);//파일 이름에 시간 넣어서 중복 없앰
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});



app.post('/PostUser',(req,res)=>{

  var id=req.body.deviceId;//json파일 이름 잘 보기
  var lat=req.body.latitude;
  var log=req.body.longitude;
  //var alarm=req.body.Alarm;

  var sql2="insert into User values('"+id+"',"+lat+","+log+",'0') on duplicate key update User_latitude="+lat+", User_longitude="+log+";";
  //console.log(sql2);

  
  connection.query(sql2, function (err, results, fields) {
      if (err) {

          console.log(err);
      }
  });
  res.send('OK');
 

});

app.post('/GetResult',(req,res)=>{

  //console.log(req.body.deviceId);
  var id=req.body.deviceId;
  let s='select * from MyPlant where MyPlant_User_id="'+id+'";';
  //console.log(s);
  connection.query(s, function (err, results, fields) {
    if (err) {

        console.log(err);
    }
    console.log({results});
    res.json(results);
  });

});
app.post('/alarm',(req,res)=>{


  var id=req.body.deviceId;
  var onoff=req.body.alarm;

  let s="update User set Alarm='"+onoff+"' where User_id='"+id+"';";

  console.log(s);
  connection.query(s, function (err, results, fields) {
    if (err) {

        console.log(err);
    }
    //console.log(results);
    res.json(results);
  });

});


app.post('/PostResult',upload.single('image'), (req, res) => {

  console.log(req.body.deviceId);
  let id=req.body.deviceId;
  let img=req.file.location;
  let pest=req.body.pestName;
  let pestper=req.body.pestPercentage;
  let date=req.body.date;

  var resultsql="insert into MyPlant values("+id+ ",'"+img+"',"+pest+","+date+","+pestper+");";
  
console.log(resultsql);

  connection.query(resultsql, function (err, results, fields) {
    if (err) {

        console.log(err);
    }
   
  });

  res.send('Ok');//s3에서의 이미지 경로
});



app.use((err, req, res, next) => {
  console.error(err);
  res.status(404).send(err.message);
});

app.listen(app.get('port'), () => {

  console.log(app.get('port'), '번 포트에서 대기 중');
});

//connection.end();
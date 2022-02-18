const { table } = require('console');
const { name } = require('ejs');
const express = require('express');
const req = require('express/lib/request');
const res = require('express/lib/response');
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require("pg");
const { exit } = require('process');
var pool;
pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:{
    rejectUnauthorized: false
  }
  // for the local host
  // connectionString: 'postgres://postgres:123wzqshuai@localhost/rectangle' 
})


var app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('pages/index'));
app.get('/database', (req,res) => {
  var getUsersQuery = `select * from rectangles`;
  pool.query(getUsersQuery, (error, result) => {
    if(error)
      res.end(error);
    var results = {'rows':result.rows};
    res.render('pages/db', results);
  })
  
});

app.post('/addRec', async(req,res) => {
  var rname = req.body.name;
  var rcolor = req.body.color;

  if(req.body.width == ''){
    var rwidth = 0;
  }
  else{
    var rwidth = req.body.width
  }

  if(req.body.height == ''){
    var rheight = 0;
  }
  else{
    var rheight = req.body.height
  }

  var rperimeter = (rwidth + rheight)*2;
  var rarea = rwidth * rheight;
  try{
    const result = await pool.query(`INSERT INTO rectangles (name, width, height, color, perimeter, area)
    VALUES ('${rname}', ${rwidth}, ${rheight}, '${rcolor}', ${rperimeter}, ${rarea})`);
    
    const result2 = await pool.query(`select * from rectangles`);
    const data = {'rows':result2.rows};
    res.render('pages/db', data);
    
  }
  catch(error){
    res.end(error);
  }
})

app.post('/deleteRec', async(req,res)=> {
  console.log("post request for /deleteRec");
  var recID = req.body.rid;
  // search the database using rid
  try{
    await pool.query( `delete from rectangles where id=${recID}`);
    const result = await pool.query(`select * from rectangles`);
    const data = {'rows': result.rows};
    res.render('pages/db', data);
  }
  catch(error){
    res.end(error);
  }
})

app.get('/:id', async(req,res)=>{
  var rid = req.params.id;
  try{
    const result =  await pool.query(`select * from rectangles where id=${rid}`);
    const data = {'rows': result.rows};
    res.render('pages/main', data);
  }
  catch(error){
    res.end(error);
  }
});

app.post('/:id', async(req,res) => {
  var rid = req.params.id;
  rid = rid.substring(1);

  var rname = req.body.name;
  var rcolor = req.body.color;
  var rwidth = req.body.width;
  var rheight = req.body.height;
  var rperimeter = rwidth*2 + rheight*2;
  var rarea = rwidth * rheight;
  try{
    await pool.query(`UPDATE rectangles
    set name='${rname}' ,
        color= '${rcolor}' ,
        width = '${rwidth}',
        height = '${rheight}',
        perimeter = '${rperimeter}',
        area = '${rarea}' 
    where id = ${rid} `);
    
    const result2 = await pool.query(`select * from rectangles where name='${rname}'`);
    const data = {'rows':result2.rows};
    res.render('pages/main', data);
    
  }
  catch(error){
    res.end(error);
  }
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

 

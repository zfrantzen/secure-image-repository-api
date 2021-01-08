const express = require('express');
const app = express();

const cors = require('cors')
const corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
 
const db = require('./src/config/db.config.js');

global.__basedir = __dirname;
  
// Resets and clears the database when the application is started
db.sequelize.sync({force: true}).then(() => {
  console.log('\n', '\n', '#### Resetting database and clearing all data. Ready to accept requests! ####', '\n', '\n');
}); 
 
// Router connections
let imageRouter = require('./src/routers/image.router.js');
let userRouter = require('./src/routers/user.router.js');
app.use('/', imageRouter);
app.use('/', userRouter);
 
// Starting the server itself
const server = app.listen(8080, function () {
 
  let host = server.address().address
  let port = server.address().port
 
  console.log('\n', '\n', 'App listening at http://' + host + ':' + port, '\n', '\n'); 
});

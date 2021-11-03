    express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    Routes = require('./routes/routes'),
    Db = require('./firebase'),
    xlsx = require('xlsx'),
    //mongoose = require('mongoose'),
    //config = require('./DB');

    //mongoose.Promise = global.Promise;
    // mongoose.connect(config.DB, { useNewUrlParser: true }).then(
    //   () => {console.log('Database is connected') },
    //   err => { console.log('Can not connect to the database'+ err)}
    // );

    app = express();

    var options = {
        dotfiles: 'ignore',
        etag: false,
        extensions: ['png','PNG', 'jpg', 'JPG', 'jpeg', 'JPEG','pdf', 'PDF', 'xlsx'],
        index: false,
        maxAge: '1d',
        redirect: false,
        setHeaders: function (res, path, stat) {
          res.set('x-timestamp', Date.now())
        }
      }
      
      app.use(express.static('uploads', options))

    app.use(bodyParser.json());
    app.use(cors());
    app.use('/static', express.static(path.join(__dirname, 'uploads')));
    //app.use('/static', express.static('uploads'))
    app.use('/api/', Routes);
    
    const port = process.env.PORT || 3100;

    const server = app.listen(port, function(){
     console.log('Listening on port ' + port);
    });

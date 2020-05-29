const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
const options = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true
};

mongoose.connect(uri, options);

const db = mongoose.connection;
db.on('error', (err) => console.log(err));

module.exports = db;
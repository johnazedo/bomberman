const express = require('express');
const app = express();
const http = require('http').Server(app);
var cors = require('cors')
const io = require('socket.io')(http);
const crypto = require('crypto');
const uuid = require('uuid');

app.use(express.static('public'));
app.use(cors)

const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`listening on *:${port}`);
});

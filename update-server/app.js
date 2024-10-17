'use strict';
const fs = require('fs');
const express = require('express');
const path = require('path');
const app = express();

app.use(require('morgan')('dev'));

app.use('/update', express.static(path.join(__dirname, 'releases')));

app.listen(3000, () => {
  console.log(`Express server listening on port ${3000}`);
});
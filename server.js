require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
// Render-ը ավտոմատ տալիս է PORT, եթե ոչ՝ վերցնում է 3000
const PORT = process.env.PORT || 3000;

// Միացնում ենք public պապկան
app.use(express.static(path.join(__dirname, 'public')));

// Սա ապահովում է, որ ցանկացած անհայտ հարցման դեպքում index.html-ը բացվի
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Սերվերը միացավ: Port ${PORT}`);
});

const express = require('express');
const app = express();

app.get('/',(req,res)=>{
    res.send('<a href="/auth/google">Authenticate With google</a>');
});

app.get('/protected',(req,res)=>{
    res.send('hello');
});

app.listen(5000,()=> console.log('listing to port : 5000'));
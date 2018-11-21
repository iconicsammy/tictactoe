const express=require('express');
const bodyParser=require('body-parser');
const app=express();
import router from './config/routes';
const server_port=4500; //change as necessary



app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/api',router);

app.listen(server_port, ()=>{
    console.log(`I am running on port ${server_port} port`)
});
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const stripe_sk = "sk_test_51NFiVSLZJc4A6R4CZ3T37n4W1v4cOF3Xk4BJKgmDc3lxUcEwvg5KCn5YcLEVR1wx62EhuoBbyeQVvr78kAnhr0C100xhZ0yTr5";
const stripe = require("stripe")(stripe_sk);
const pg = require("pg");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");

const app = express();
const port = 3000;


app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}))
app.use("/img", express.static("./page/img"));
app.use(express.static("./page"));

const mossy_client = new pg.Client({
    user:"server",
    password:"server_testing",
    database:"mossy",
    host: "192.168.1.200"
});

mossy_client.connect((err)=>{
    if(err){
        console.log(err);
    }else{
        console.log("connected to mossy database");
    }
});

app.get("/", (req,res)=>{
    res.sendFile(path.resolve(__dirname + "/page/mossy.html"));
});

app.get("/join",(req,res)=>{
    res.sendFile(path.resolve(__dirname + "/page/join.html"));
})

app.post("/join/subscription",  async (req,res)=>{
    let donation  = parseInt(req.body.import) * 100;

    const order_data = {
        success_url: "http://localhost:3000",
        cancel_url:  "http://localhost:3000",
        line_items:[
            {
              price_data:{
                  currency: "eur",
                  product_data: {
                      description: "join in the comunity",
                      name: "mossy membership",
                  },
                  unit_amount: donation,
              },
              quantity: 1,
          }
        ],
        mode: 'payment',
        customer_creation: "if_required",
        phone_number_collection: {
            enabled: true,
        },

    };

    try{
        const session = await stripe.checkout.sessions.create(order_data);
        res.redirect(session.url);

    }catch{
        res.redirect("/");
    }
});

app.get("/get_code", async(req,res)=>{
    const code = Date.now();
    res.send({code: code});
})

app.post("/interaction", async (req,res)=>{
    console.log(req.body)
    if(req.body.code_id && req.body.action){
        const query = await mossy_client.query({text: "insert into users_actions(code_id,action) values($1,$2)", values:[req.body.code_id, req.body.action]})
        res.sendStatus(200);
    }else{
        res.sendStatus(500);
    }
});

app.post("/session/close", async (req,res)=>{
    console.log(req.body)
    if(req.body.code_id && req.body.action){
        const query = await mossy_client.query({text: "insert into users_actions(code_id,action,duration) values($1,$2,$3)", values:[req.body.code_id, req.body.action, req.body.duration]})
        res.sendStatus(200);
    }else{
        res.sendStatus(500);
    }
})



////////////// admin page ////////////////
app.use(cookieParser());
//testing_123
const email = "test@gmail.com";
const password = "$2a$10$GmSTiXTSSDZ7kC5GAJ.FS.MCZh65K21iG9xbHvnitAwHC0r6PiwgC";
//admin setup
const code = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
function codegen(){
    let cd = "";
    for(let i = 0; i < 40; i++){
        cd = cd+code[Math.floor(Math.random()*58)];
    }
    return cd;
}
///admin login
let AC00 = null; //admin cookies
app.get("/admin/login",(req,res)=>{
    res.sendFile(__dirname+"/admin/admin_login.html");
});
app.post("/admin/login",(req,res)=>{
    req.body.email = req.body.email.toLowerCase();
    if(req.body.email == email){
        if(bcrypt.compareSync(req.body.password,password)){
            const code = codegen() + codegen();
            AC00 = code;
            res.cookie("AC00",code,{httpOnly: true, sameSite:"strict"});
            res.send({response:"success", url:"/admin/home.html"});
        }else{
            res.send({response:"error"});
        }
    }else{
        res.send({response:"error"});
    }
});

///////// middleware
app.use("/admin",(req,res,next)=>{
    console.log(req.cookies)
    if(AC00 == null ||  req.cookies.AC00 != AC00){
        res.redirect("/admin/login");
    }else{
        next();
    }
});
app.use("/admin",express.static("./admin"));

app.get("/admin/get_data/:time", async(req,res)=>{

    const time_req = req.params.time;
    let time = "date >= now() - interval '1 month'";
    
    if(time_req == "today"){
        time = "date >= now() - interval '1 day'"
    }else if(time_req == "week"){
        time = "date >= now() - interval '1 week'";
    }
    

    try{
        const query = await mossy_client.query({text: "select * from users_actions where " + time});
        const current_date  = new Date();
        console.log({
            today: current_date.toISOString()
        })
        res.send({data: query.rows, today: current_date.toISOString()});
    }catch (e){
        console.log(e)
        res.sendStatus(500);
    }
})

app.listen(port);

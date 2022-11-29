const express=require("express")
const http=require("http")
const {Server}=require("socket.io")
import{currencies}  from "db.json"
const { createTransport } =require ("nodemailer")
const app=express()
const server=http.createServer(app)
const io=new Server(server)
let timer
app.use(express.urlencoded({extended:true}))
app.use(express.json())
const data=currencies.map((el)=>{
   let curr={ ...el,
    value:Math.random()*100,
    color: "black",
		changeBy: 0,
		userOwns: 0,
   }
   return curr
})

const transporter = createTransport({
	host: "smtp.ethereal.email",
	port: 587,
	auth: {
		user: email,
		pass: password,
	},
});
let userWalletBalance = 1000;

const appData= {
	currencies: data,
	user: {
		email,
		password,
		walletBalance: userWalletBalance,
	},
};
app.get("/",(req,res)=>
{
    res.sendFile(__dirname+"/index.html")
})

io.on("connection",(conn)=>{
    console.log("new user connected")
	if (timer) {
		clearInterval(timer);
	}
    
timer=setInterval(()=>{
    for (let i = 0; i < data.length; i++) {
        const changeBy = Math.random();
        const addOrSub = Math.random() > 0.5 ? "add" : "sub";
        const oldVal = data[i].value;
        if (addOrSub === "add") {
            data[i].value = oldVal + changeBy;
            data[i].color = "red";
           data[i].changeBy = -changeBy;
        } else {
            data[i].value = oldVal - changeBy;
            data[i].color = "green";
          data[i].changeBy = changeBy;
        }
    }

    socket.emit("values", {
        currencies: appData.currencies,
        userWalletBalance: appData.user.walletBalance,
    });
}, 1000);

const buySuccessful = () => {
    socket.emit("success", {
        message: `Buy successfully!`,
    });
};
const insufficientBalance = () => {
    socket.emit("failure", {
        message: ` Insufficient balance!`,
    });
};

socket.on("buy", async () => {
    console.log("buy ");
    let info = await transporter.sendMail({
        from: "contact@trader.io",
        to: email,
        subject: "Buy Order is placed successfully!",
        text: `Your order of buy  was placed successfully and it will be processed soon.`,
    });
    console.log(`mail sent: `, info.messageId);
    setTimeout(() => {
       
        for (let i = 0; i < data.length; i++) {
            if (data[i].code === code) {
                if (appData.user.walletBalance >= data[i].value) {
                    appData.user.walletBalance -= data[i].value;
                    data[i].userOwns++;
                } else {
                    insufficientBalance();
                }
                break;
            }
        }
        buySuccessful();
    }, 500);
});

});








server.listen(8080,()=>{
    console.log("server started on port 8080")
})






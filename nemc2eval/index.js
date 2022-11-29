const express=require("express")
const mongoose=require("mongoose")
const UserModel=require("./models/User.model")
const argon2=require("argon2")
const jwt=require("jsonwebtoken")
const app=express()
const nodemailer=require("nodemailer")
const { verify } = require("crypto")

app.use(express.urlencoded({extended:true}))
app.use(express.json())

const blackList=[]

//Signup

app.post("/signup",async(req,res)=>{
    const data =req.body
    if(data.email && data.password)
    {
        try{
            const passwordCheck=await argon2.hash(data.password)
            data.password=passwordCheck
    const user=new UserModel(data)
    await user.save()
    res.send({user},201)
        }
        catch(err){
            res.send(err.message)
        }
    }
    else{
        res.status(401).send("Body is missing required data")
    }
})

//Login

app.post("/login",async(req,res)=>{
    let{email,password} =req.body
    if(email && password){
        let user=await UserModel.findOne({email})
        if(user){
            try{
                const check=await argon2.verify( user.password,password)
                const userData={
                    _id:user._id,
                    email:user.email,
                    role:user.role
                }
                if(check)
                {
                    const maintoken=jwt.sign(userData,"maintoken",{
                        expiresIn :"5 minutes"
                    })
                    const refreshtoken=jwt.sign(userData,"refreshtoken",{
                        expiresIn :"7 days"
                    })
                    res.send({
                        data:userData,
                        tokens:{
                            maintoken,
                            refreshtoken
                        },
                    },
                        200
                    )
                }
                else{
                    res.status(401).send({message: "Invalid Credentials"})
                }
                }
                catch(err)
                {
                    console.log(err)
                    res.send(err.message)
                }
            }
            else{
                res.send(404)
            }
        }
        else{
            res.send("Incomplete Data")
        }
    })

//UserDetailsById

app.get("/user/:userid",async(req,res)=>{
    const {userid} =req.params

    const user=await UserModel.findById(userid)
    const token =req.headers["authorization"]
    if(blackList.includes(token))
    {
        return res.status(401).send(401)
    }
    if(!token)
    {
        return res.status(401).send("Unauthorized")
    }
   
    try{
        const verification=jwt.verify(token)
        console.log("verification",verification)
        return res.send(user)
    }
    catch(err)
    {
        if(err.message==="jwt expired")
        {
            blackList.push(token)
        }
        return res.status(401).send("Token is Invalid")
    }
})







//Get Otp

const transport=nodemailer.createTransport({
    host:"smtp.ethereal.email",
    port:587,
    auth:
    {
        user:"akshaysrij@ethereal.email",
        password:"akshaysrij"
    }
})


const obj={}

app.post("/reset-password/getotp",(req,res)=>{
    const{email}=req.body
    const otp=Math.floor(Math.random()*100000)

    obj[email]=otp
transport.sendMail({
    to:email,
    from: "example@test.com",
    subject: "OTP",
    text:`Hello ${email} ,Your OTP is ${otp}`
}).then(()=>{
    res.send("Otp sent successs")
})
})

// ResetPassword





app.post("/reset-password/reset",(req,res)=>{
    const {email,newPassword,otp} =req.body
    if(obj[email] === otp)
    {
        delete obj[email]
        return res.send("new Password updated successfully")
    }
    return res.status(401).send("Invalid OTP")
})



//Verify
function getToken(data){
    return jwt.sign(data)
    {
        expiresIn: "2 days"
    }
}


app.post("/verify",async(req,res)=>{
    const {refreshtoken}=req.body
    if(blackList.includes(refreshtoken))
    {
        return res.status(401).send(401)
    }
    try{
        const data=jwt.verify(refreshtoken)
        if(data)
        {
            delete verify.iat
            delete verify.exp
        
        const maintoken=jwt.getToken(data)
        return res.send({token: maintoken})
        }
        else{
            res.status(401).send({message: "kindly login again"})
        }
    }
    catch(e)
    {
        if(err.message==="jwt expired")
        {
            blackList.push(token)
        }
        return res.status(401).send("refresh token invalid")
    }
})

mongoose.connect("mongodb://localhost:27017/heroes").then(()=>{
app.listen(8080,()=>{
    console.log("Server Startedat http://localhost:8080")
})
})
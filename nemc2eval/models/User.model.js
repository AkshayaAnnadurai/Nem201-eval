const {Schema,model} =require("mongoose")

const UserSchema= new Schema({
    email:{type:String,unique:true,required:true},
    password:String,
    role:{type:String,
    enum:["HR","Employee","Guests"],default:"Employee"}
})

const UserModel =model("user",UserSchema)
module.exports=UserModel
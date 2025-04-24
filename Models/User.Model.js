import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from "dotenv";
config();
const userSchema = new Schema({
    name: {
        type: String,
        lowercase: true,
        trim: true,

    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please fill in a valid email address',
          ], // Matches email against regex


    },
    password: {
        type: String,
        // minLength: [4, 'Password must be at-least 4 Charcaters'],
        // maxLength:[10,'Password must be at max 10 Charcaters'],
        select: false
    },
    // isVerified: {
    //     type: Boolean,
    //     default: false
    //   },
      lastLogin: {type:Date},
    //   authToken: String,
      isActive:{
        type:Boolean,
        default:false
      },
    avatar: {
        public_id: {
            type: String,
        },
        secure_url: {
            type: String,
        }
    },
    // forgetPasswordToken: String,
    // ForgetPasswordExpiry: Date
}, {
    timestamps: true,
});

userSchema.pre('save', async function (next) {
    // Only hash password if it's modified
    if (this.isModified('password') && this.password !== undefined) {
        this.password = await bcrypt.hash(this.password, 10);
    }

    // Assign random name if name is not provided
    if (!this.name || this.name.trim() === "") {
        const randomNames = ['John', 'Jane', 'Doe', 'Smith', 'Emily', 'Michael', 'Sarah', 'David', 'Emma', 'James'];
        const randomIndex = Math.floor(Math.random() * randomNames.length);
        this.name = randomNames[randomIndex];
    }

    next(); // Always remember to call next
});



userSchema.methods={
    comparePassword:async function(plainPassword){
        console.log(plainPassword,this.password)
        return bcrypt.compare(plainPassword,this.password);
    },
    generateJWTToken:async function(){
   return await  jwt.sign({id:this._id,email:this.email},//payload
    process.env.JWT_SECRET,
    {
        expiresIn:process.env.JWT_EXPIRY,
    })
    },
    generatePasswordToken:async function(){
        // we use crypto method to dynamic token
        const resetToken=crypto.randomBytes(20).toString('hex');

        this.forgetPasswordToken=crypto.createHash('sha256')
        .update(resetToken)
        .digest('hex');
        
        this.ForgetPasswordExpiry=Date.now()+15*60*1000;// 15 min from now
    }
}

const User=model('User',userSchema);

export { User};
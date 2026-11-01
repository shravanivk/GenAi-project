const userModel=require("../models/user.model")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const tokenBlacklistModel=require("../models/blacklist.model")
async function registerUserController(req,res){
const {username,email,password}=req.body

if(!username || !email || !password){
    return res.status(400).json({
        message:"please provide username,email and password"
    })
}
const isUserIdAlreadyExist=await userModel.findOne({
    $or:[{username},{email}]
})
if(isUserIdAlreadyExist){
    return res.status(400).json({
        message:"Account already exist with this this email or username"
    })
}
const hash=await bcrypt.hash(password,10)

const user=await userModel.create({
    username,
    email,
    password:hash
})
const token=jwt.sign(
{id:user._id,username:user._username},
 process.env.JWT_SECRET,
 {expiresIn:"1d"}
)
res.cookie("token",token)

res.status(201).json({
    message:"user registered successfully",
    user:{
        id:user._id,
        username:user._username,
        email:user.email
    }

    
})

}
//####
//login controller
async function loginUserController(req, res) {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    // Suggested completion for password verification (e.g., using bcrypt):
    const isPass = await bcrypt.compare(password, user.password);

    if (!isPass) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }

    const token=jwt.sign(
{id:user._id,username:user._username},
 process.env.JWT_SECRET,
 {expiresIn:"1d"}
)
res.cookie("token",token)
res.status(200).json({
message:"user loggedin successfully",
user:{
        id:user._id,
        username:user._username,
        email:user.email
    }
})
}


async function logoutUserController(req, res) {
    const token = req.cookies.token;

    if (token) {
        await tokenBlacklistModel.create({ token });
    }

    res.clearCookie("token");

    res.status(200).json({
        message: "User logged out successfully"
    });
}

async function getMeController(req, res) {

    const user = await userModel.findById(req.user.id)

    res.status(200).json({
        message:"user details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}
module.exports={
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
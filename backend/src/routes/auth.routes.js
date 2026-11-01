const {Router}=require("express")
const authController=require("../controllers/auth.controllers")
const authMiddleware=require("../middlewares/auth.middleware")
const authRouter=Router()

/**
 * @route POST /api/auth/register
 * @description register a new user
 * @access public
 *  */
authRouter.post("/register",authController.registerUserController)


authRouter.post("/login",authController.loginUserController)

authRouter.get("/logout",authController.logoutUserController)

authRouter.get("/get-me",authMiddleware.authUser,authController.getMeController)
module.exports=authRouter

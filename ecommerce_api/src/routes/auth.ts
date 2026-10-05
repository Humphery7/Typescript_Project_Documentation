import express, { type Request, type Response, type Express, type NextFunction, type Router } from "express"
import { loginService, signupService } from "../services/databaseService.js"
import bcrypt from "bcrypt"


const router: Router = express.Router()




router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashed_password = await bcrypt.hash(password, salt);
        const signup_result = await signupService(name, email, hashed_password);
        res.status(200).json({ message: "User created successfully", data: signup_result })

    } catch (e) {
        next(e)
    }
})



router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const {user, token} = await loginService(email, password);
        res.status(200).json({ message: "Login successful", user: user, token:token})
    } catch (e) {
        next(e)
    }
})


export default router
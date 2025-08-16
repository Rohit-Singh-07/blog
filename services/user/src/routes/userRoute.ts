import express from 'express'
import {
  getUserProfile,
  loginUser,
  myProfile,
  updateProfilePic,
  updateUser,
} from '../controllers/userController.js'

import { isAuth } from '../middlewares/isAuth.js'
import uploadFile from '../middlewares/multer.js'

const router = express.Router()

router.post("/login", express.json(), loginUser) 

router.get("/me", isAuth, myProfile)
router.get("/user/:id", getUserProfile)
router.post("/user/update", isAuth, updateUser)
router.post("/user/update/pic", isAuth, uploadFile, updateProfilePic)

export default router

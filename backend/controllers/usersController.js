const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')


// @desc Get all user
// @route GET /users
// @acces Private

const getAllUsers = asyncHandler(async(req,res) => {
    const users = await User.find().select('-password').lean()
    if(!users?.length) {
        return res.status(400).json({message : "There's no users found"})
    }
    res.status(200).json(users)
})



// @desc Create users
// @route Post /users
// @acces Private

const creatNewUser = asyncHandler(async(req,res) => {
    const {username,password,roles} = req.body

    //confirm data
    if(!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({message: "All fields are required"})
    }
    // check if the user already exists with the same username... Aka duplicates
    const duplicate = await User.findOne({username}).lean().exec()
    if(duplicate) {
        return res.status(409).json({message: "Duplicate username"})
    }
    const hashedPassword = await bcrypt.hash(password,10) 
    const userObject = {username, "password": hashedPassword, roles}
    //create user and store it
    const user = await User.create(userObject)
    if(user) {
        res.status(201).json({message: `User ${username} is created successfuly`})
    }
    return res.status(400).json({message: "user couldn't be created, something is wrong"})
    
})



// @desc Update users
// @route patch /users
// @acces Private

const updateUser = asyncHandler(async(req,res) => {
    const { id, username, roles, active, password } = req.body
    if( !id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({message: "All fields are required"})
    }
    const user = await User.findById(id).exec()
    if(!user) {
        return res.status(400).json({message: "user not found"})
    }
    //check if user exists
    const duplicate = await User.findOne({username}).lean().exec()
    // Allow updates on the original user 
    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({message: "Duplicate Username"})
    }
    user.username= username
    user.roles = roles
    user.active = active
    if(password){
        //hashing pwd
        user.password = await bcrypt.hash(password,10)
    }
    const updatedUser = await user.save()
    res.status(201).json({message: `${updatedUser.username} is updated`})
})

// @desc delete users
// @route DELETE /users
// @acces Private

const deleteUser = asyncHandler(async(req,res) => {
    const {id} = req.body
    if(!id){
        return res.status(400).json({message: "user ID required"})
    }
    const note = await Note.findOne({user: id}).lean().exec()
    if(note) {
        return res.status(400).json({message: 'User has assigned notes'})
    }
    const user = await User.findById(id).exec()
    if(!user){
        return res.status(400).json({message:"User not found"})
    }
    const result = await user.deleteOne()
    const reply = `username ${result.username} with Id: ${result._id} is deleted`
    res.json(reply)
})



module.exports = { 
    getAllUsers,
    creatNewUser,
    updateUser,
    deleteUser
}
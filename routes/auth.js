const router = require('express').Router()
const User = require('../models/User')
const { registerValidation, loginValidation } = require('../validation')
const bcrypt = require('bcrypt')

router.post('/register', async (req, res) => {
  // validate data
  const { error } = registerValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  // cheking if the user is already in the database
  const emailExist = await User.findOne({ email: req.body.email })
  if (emailExist) return res.status(400).send('Email already exists')

  // hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPasword = await bcrypt.hash(req.body.password, salt)

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPasword,
  })

  try {
    await user.save()
    res.send({ user: user._id })
  } catch (err) {
    res.status(400).send(err)
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  // validate data
  const { error } = loginValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  // check if email exists
  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(400).send('Email is wrong!')

  // password is correct?
  const validPass = await bcrypt.compare(req.body.password, user.password)
  if (!validPass) return res.status(400).send('Password is wrong!')

  res.send('Logged in!')
})

module.exports = router

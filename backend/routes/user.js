const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');

router.get('/', async (req, res) => {
	const users = await User.find();
	res.send(users);
	})

router.post('/login', async (req, res) => {
	//verify user
	try {
		const user = await User.findOne({ username: req.body.username });
		if (!user) res.status(400).send('Invalid credentials');

		//compare user password in DB with password sent
		const password = req.body.password;
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) res.status(400).send('Invalid credentials');

		res.status(200).send(user);
	} catch {
		res.status(500);
	}
})

router.post('/register', async (req, res) => {
	//add new user
  try {
		//check if username or email already exists
		const userNameExists = await User.findOne({username: req.body.username});
		if (userNameExists) res.status(400).send('username exists');

		const emailExists = await User.findOne({email: req.body.email});
		if (emailExists) res.status(400).send('email in use');

		//validate password meets criteria
		const password = req.body.password;
		const hashedPass = await bcrypt.hash(password, 10);

    const user = new User({
			firstName: req.body.firstName,
			lastName: req	.body.lastName,
			username: req.body.username,
			email: req.body.email,
			password: hashedPass
			})

		await user.save();

		//TODO send authentication token

		res.send(user);
	} catch {
		res.status(500);
	}
})

module.exports = router;

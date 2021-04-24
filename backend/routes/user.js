const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');

router.get('/', async (req, res) => {
	const user = res.locals.user;
	if (user) {
		res.status(200).send(user);
	} else {
		res.status(200).send(false);
	}
	})

router.post('/login', async (req, res) => {
	//verify user
	try {
		const { username, password } = req.body;

		const user = await User.findOne({ username: username });
		if (!user) res.status(401).send('Invalid credentials');

		//compare user password in DB with password sent
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) res.status(401).send('Invalid credentials');

		//add user ID to session object
		req.session.userId = user._id
		res.status(200).send('valid credentials');
	} catch {
		res.status(500).send();
	}
})

router.post('/logout', (req, res) => {
		req.session.destroy((err) => {
				if (err) res.status(500).send()

				res.clearCookie('connect.sid');
				res.status(200).send({ redirect: '/login' });
			});
	})

router.post('/register', async (req, res) => {
	//add new user
  try {
		const { username, email, password } = req.body;

		//check if username or email already exists
		const usernameExists = await User.findOne({ username: username });
		if (usernameExists) res.status(400).send('Username exists');

		const emailExists = await User.findOne({ email: email });
		if (emailExists) res.status(400).send('Email already registered');

    const user = new User({
			username: username,
			email: email,
			password: await bcrypt.hash(password, 10)
			})

		await user.save();

		//add user id to session object
		req.session.userId = user._id
		res.status(200).send(user);
	} catch {
		res.status(500).send();
	}
})

module.exports = router;

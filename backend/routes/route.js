const express = require('express');
const router = express.Router();
const { Route } = require('../models/route');

const invalidRouteMessage = { error: 'Invalid Route' };

router.get('/', async (req, res) => {
	const routes = await Route.find();
	res.send(routes)
  })

router.post('/', async (req, res) => {
  try {
    const route = new Route({
  		name: req.body.name,
      alt: req.body.alt
      })

    await route.save();
  	res.send(route);
  }
  catch {
    res.status(404);
    res.send({ error: 'Invalid Body' });
  }
  })

router.delete('/', async (req, res) => {
	try {
		const cleared = await Route.deleteMany({});
		res.send('cleared');
	}
	catch {
		res.status(404);
		res.send('clear failed');
	}
	})

router.get('/:id', async (req, res) => {
  try {
		const route = await Route.findById(req.params.routeID);
    res.send(route);
  }
  catch {
    res.status(404);
    res.send(invalidRouteMessage);
  }
})

router.patch('/:id', async (req, res) => {
	try {
		const route = await Route.findById(req.params.routeID);

    for (const key in req.body) {
      route[key] = req.body[key];
    }

    await route.save();
		res.send(route);
	} catch {
		res.status(404)
		res.send(invalidRouteMessage)
	}
})

router.delete('/:id', async (req, res) => {
	try {
		await Route.deleteOne({ _id: req.params.id });
		res.status(204).send();
	} catch {
		res.status(404);
		res.send(invalidRouteMessage);
	}
})

module.exports = router

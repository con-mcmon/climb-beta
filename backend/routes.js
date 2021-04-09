const express = require('express');
const router = express.Router();
const { Route, Crux, Node } = require('./models/route');

const invalidRouteMessage = { error: 'Invalid Route' };

function buildNodes(nodes) {
		return nodes.map(({ x, y, type, position, note, parent }) => {
			return new Node({
				x: x,
				y: y,
				type: type,
				position: position,
				note: note,
				parent: parent
				})
			})
		}

router.get('/', async (req, res) => {
	const routes = await Route.find();
	res.send(routes)
  })

router.post('/', async (req, res) => {
  try {
    const route = new Route({
  		name: req.body.name,
      alt: req.body.alt,
			nodes: buildNodes(req.body.nodes)
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
    const route = await Route.findOne({ _id: req.params.id });
    res.send(route);
  }
  catch {
    res.status(404);
    res.send(invalidRouteMessage);
  }
})

router.patch('/:id', async (req, res) => {
	try {
		const route = await Route.findOne({ _id: req.params.id });
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

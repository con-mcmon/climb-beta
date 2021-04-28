const express = require('express');
const router = express.Router();
const { Route } = require('../models/route');

router.get('/:routeID', async (req, res) => {
  //find all Beta belonging to specified Route
  try {
    const route = await Route.findById(req.params.routeID);
  	res.send(route.beta);
  }
  catch {
    res.status(404).send('invalid route');
  }
  })

router.post('/:routeID', async (req, res) => {
  //add a new Beta to specified Route
  try {
    const route = await Route.findById(req.params.routeID);

    let { holds, user } = req.body;
    holds = holds.map(({ coordinates, type, position, note }) => ({ coordinates, type, position, note }));

    route.beta.push({ holds, user });
    await route.save();
    res.send(route);
  }
  catch {
    res.status(404).send('bad request');
  }
  })

router.patch('/:routeID/:betaID', async (req, res) => {
  //modify existing Beta of Route
  //what parameters will be used to find the Beta?
  //front end needs to know the id of each node
  try {
    const route = await Route.findById(req.params.routeID);
    const beta = route.beta.id(req.params.betaID);
    //modify beta.nodes with req.body
    res.send(beta.holds);
  }
  catch {
    res.status(404).send('bad request');
  }
  })

module.exports = router;

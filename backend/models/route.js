const mongoose = require('mongoose');

const HoldSchema = new mongoose.Schema({
  coordinates: {
    x: Number,
    y: Number
  },
  type: String,
  position: Number,
  note: String,
  parent: String
  })

const BetaSchema = new mongoose.Schema({
  holds: [HoldSchema]
  });

const CruxSchema = new mongoose.Schema({
  alt: String,
  coordinates: {x: Number, y: Number},
  });

const RouteSchema = new mongoose.Schema({
  name: String,
  crux: [CruxSchema],
  beta: [BetaSchema]
  });

Route = mongoose.model('Route', RouteSchema);

exports.Route = Route;

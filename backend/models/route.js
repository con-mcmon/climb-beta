const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  type: String,
  position: Number,
  note: String,
  parent: String
  })

const CruxSchema = new mongoose.Schema({
  alt: String,
  coordinates: {x: Number, y: Number },
  });

const RouteSchema = new mongoose.Schema({
  name: String,
  alt: String,
  nodes: [NodeSchema],
  crux: [CruxSchema]
});

Route = mongoose.model('Route', RouteSchema);
Crux = mongoose.model('Crux', CruxSchema);
Node = mongoose.model('Node', NodeSchema);

exports.Route = Route;
exports.Crux = Crux;
exports.Node = Node;

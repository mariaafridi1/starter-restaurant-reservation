const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

//? MIDDLEWARE FOR VALIDATION?

/**
 * List handler for reservation resources
 */

async function list(req, res) {
  const query = req.query;
  const data = await service.list(query);
  res.json({ data });
}

async function create(req, res) {
  const data = await service.create(req.body.data);

  res.status(201).json({ data });
}

module.exports = {
  list,
};

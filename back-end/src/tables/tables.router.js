const router = require("express").Router();
const controller = require("./tables.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
  .route("/")
  .get(conroller.list)
  .post(controller.create)
  .all(methodNotAllowed);

router
  .route("/:table_id/seat")
  .put(controller.update)
  .delete(conroller.destroy)
  .all(methodNotAllowed);

module.exports = router;

const tablesService = require("./tables.service");
const reservationsService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

//* PIPELINE

const VALID_FIELDS = [
  "table_name",
  "capacity",
  "people",
  "reservation_id",
  "created_at",
  "updated_at",
];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;
  if (!data) {
    return next({
      status: 400,
      message: `no data provided`,
    });
  }

  const invalidFields = Object.keys(data).filter((field) => {
    !VALID_FIELDS.includes(field);
  });

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  return next();
}

const hasRequiredProperties = hasProperties("table_name", "capacity");

function validCreate(req, res, next) {
  const {
    data: { table_name, capacity },
  } = req.body;
  if (table_name.length < 2) {
    return next({
      status: 400,
      message: `table_name.`,
    });
  }
  if (capacity < 1) {
    return next({
      status: 400,
      message: `capacity`,
    });
  }
  next();
}

async function create(req, res) {
  const newTable = await tablesService.create(req.body.data);
  res.status(201).json({
    data: newTable,
  });
}

async function list(req, res) {
  res.json({ data: await tablesService.list() });
}

async function tableExists(req, res, next) {
  const table = await tablesService.read(req.params.table_id);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({
    status: 404,
    message: `Table ${req.params.table_id} cannot be found.`,
  });
}

function read(req, res) {
  res.json({ data: res.locals.table });
}

function hasData(req, res, next) {
  if (req.body.data) {
    return next();
  }
  next({
    status: 400,
    message: `Body must have a data property.`,
  });
}

function reservationIdExists(req, res, next) {
  const { reservation_id } = req.body.data;
  if (reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: `reservation_id`,
  });
}

async function reservationExists(req, res, next) {
  const reservation = await reservationsService.read(
    req.body.data.reservation_id
  );
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation ${req.body.data.reservation_id} cannot be found.`,
  });
}

function validUpdate(req, res, next) {
  const { table, reservation } = res.locals;
  if (table.reservation_id) {
    return next({
      status: 400,
      message: `Table is occupied.`,
    });
  }
  if (reservation.status === "seated") {
    return next({
      status: 400,
      message: `Reservation is already seated`,
    });
  }
  if (table.capacity < reservation.people) {
    return next({
      status: 400,
      message: `capacity`,
    });
  }
  next();
}
async function update(req, res) {
  const updatedTable = {
    ...res.locals.table,
    reservation_id: res.locals.reservation.reservation_id,
  };

  const updatedReservation = {
    ...res.locals.reservation,
    status: "seated",
  };

  const tableInfo = await tablesService.update(updatedTable);

  const resoInfo = await reservationsService.update(
    res.locals.reservation.reservation_id,
    updatedReservation
  );

  res.json({ tableInfo });
}

function isTableOccupied(req, res, next) {
  if (res.locals.table.reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: `Table is not occupied.`,
  });
}

async function destroy(req, res) {
  const updatedTable = {
    ...res.locals.table,
    reservation_id: null,
  };

  const seatedReservation = await reservationsService.read(
    res.locals.table.reservation_id
  );
  const tableInfo = tablesService.update(updatedTable);
  const resoInfo = reservationsService.update(res.locals.table.reservation_id, {
    ...seatedReservation,
    status: "finished",
  });
  res.json({ tableInfo });
  // res.json({ resoInto });
}
module.exports = {
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    validCreate,
    asyncErrorBoundary(create),
  ],
  list: asyncErrorBoundary(list),
  read: [asyncErrorBoundary(tableExists), read],
  update: [
    asyncErrorBoundary(tableExists),
    hasData,
    reservationIdExists,
    asyncErrorBoundary(reservationExists),
    validUpdate,
    asyncErrorBoundary(update),
  ],
  destroy: [
    asyncErrorBoundary(tableExists),
    isTableOccupied,
    asyncErrorBoundary(destroy),
  ],
};

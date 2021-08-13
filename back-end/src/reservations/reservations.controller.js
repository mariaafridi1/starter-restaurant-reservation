const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");
const dayIsTues = require("../errors/dayIsTues");
const withinOpenHours = require("../errors/withinOpenHours");

//*  PIPELINE

const VALID_FIELDS = [
  "reservation_id",
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
  "created_at",
  "updated_at",
];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;

  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_FIELDS.includes(field)
  );

  if (invalidFields.length)
    return next({
      status: 400,
      message: `Invalid Field(s): ${invalidFields.join(", ")}`,
    });
  return next();
}

const hasRequiredProperties = hasProperties(
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people"
);

const isValid = (req, res, next) => {
  const {
    data: { reservation_date, reservation_time, people, status },
  } = req.body;
  const date = new Date(reservation_date);
  const currentDate = new Date();

  if (!people || people < 1) {
    next({ status: 400, message: "Reservation needs people!" });
  } else if (typeof req.body.data.people !== "number") {
    next({ status: 400, message: "people needs to be a number!" });
  }

  if (reservation_date.match(/[a-z]/i)) {
    return next({
      status: 400,
      message: `reservation_date`,
    });
  }

  if (reservation_time.match(/[a-z]/i)) {
    return next({
      status: 400,
      message: `reservation_time`,
    });
  }

  if (
    date.valueOf() < currentDate.valueOf() &&
    date.toUTCString().slice(0, 16)
  ) {
    return next({
      status: 400,
      message: `Reservations must be made in the future!`,
    });
  }
  if (dayIsTues(reservation_date)) {
    return next({
      status: 400,
      message: `The restaurant is closed on Tuesday!`,
    });
  }
  if (withinOpenHours(reservation_time)) {
    return next({
      status: 400,
      message: `Restaurant is closed at this time`,
    });
  }
  if (status === "seated" || status === "finished") {
    return next({
      status: 400,
      message: `Reservation has been seated or is finished.`,
    });
  }
  next();
};

//* MIDDLEWARE
async function reservationExists(req, res, next) {
  const reservation = await service.read(req.params.reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation ${req.params.reservation_id} cannot be found.`,
  });
}

const validStatusUpdate = (req, res, next) => {
  const {
    data: { status },
  } = req.body;
  const { reservation } = res.locals;

  if (reservation.status === "finished") {
    return next({
      status: 400,
      message: `A finished reservation cannot be updated.`,
    });
  }

  if (status === "cancelled") return next();

  if (status !== "booked" && (status !== "seated") !== "finished") {
    return next({
      status: 400,
      message: `Cannot update unknown status`,
    });
  }
  next();
};

async function updateStatus(req, res) {
  const updatedReservation = {
    ...res.locals.reservation,
    status: req.body.data.status,
  };
  const data = await service.update(updatedReservation);
  res.json({ data });
}

//* CRUD

async function create(req, res) {
  const newReservation = await service.create(req.body.data);

  res.status(201).json({
    data: newReservation[0],
  });
}

async function list(req, res) {
  const date = req.query.date;
  // //console.log(date);
  const mobile_number = req.query.mobile_number;
  console.log(mobile_number);
  if (date) {
    const data = await service.list(date);
    res.json({
      data,
    });
  } else if (mobile_number) {
    res.json({
      data: await service.search(mobile_number),
    });
  }
}

// async function list(req, res) {
//   let data;

//   if (req.query.date) {
//     data = await service.list(req.query.date);
//   } else if (req.query.mobile_number) {
//     data = await service.search(req.query.mobile_number);
//   }

//   res.json({ data });
// }

function read(req, res) {
  res.json({ data: res.locals.reservation });
}

async function update(req, res) {
  const updatedReservation = { ...req.body.data };
  const data = await service.update(updatedReservation);
  res.json({ data });
}

module.exports = {
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    isValid,
    asyncErrorBoundary(create),
  ],
  list: [asyncErrorBoundary(list)],
  read: [asyncErrorBoundary(reservationExists), read],
  update: [
    asyncErrorBoundary(reservationExists),
    hasOnlyValidProperties,
    //hasRequiredProperties,
    isValid,
    asyncErrorBoundary(update),
  ],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    validStatusUpdate,
    asyncErrorBoundary(updateStatus),
  ],
};

const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

//? MIDDLEWARE FOR VALIDATION
function validateReservation(req, res, next) {
  const {
    data: {
      first_name,
      last_name,
      mobile_number,
      reservation_date,
      reservation_time,
    } = {},
  } = req.body;
  let temp_reservation_time = reservation_time.replace(":", "");

  if (
    !first_name ||
    first_name === "first name" ||
    first_name === "" ||
    first_name.includes(" ")
  ) {
    next({ status: 400, message: "Need a valid First Name!" });
  } else if (!last_name || last_name === "last name" || last_name === "") {
    next({ status: 400, message: "Need a valid Last Name!" });
  } else if (mobile_number.length !== 12 || mobile_number === "555-555-5555") {
    next({ status: 400, message: "Need a valid phone number!" });
  } else if (Date.parse(reservation_date) < Date.now()) {
    next({ status: 400, message: "Reservation needs to be on a future date!" });
  } else if (new Date(reservation_date).getDay() + 1 === 2) {
    next({
      status: 400,
      message: "We are closed on Tuesdays! Pick a day when we are open.",
    });
  } else if (temp_reservation_time < 1030) {
    next({
      status: 400,
      message: "Reservation cannot be before business hours!",
    });
  } else if (temp_reservation_time > 2130) {
    next({
      status: 400,
      message:
        "Reservation cannot be less than one hour before business closing!",
    });
  } else {
    console.log("VALID RESERVATION");
    next();
  }
}
// const validProperties = [
//   "first_name",
//   "last_name",
//   "mobile_number",
//   "reservation_date",
//   "reservation_time",
//   "people",
// ];

// function bodyHasData(propName) {
//   return (req, res, next) => {
//     const value = req.body.data[propName];
//     if (value) return next();
//     next({ status: 400, message: `Reservation must include a ${propName}` });
//   };
// }
/**
 * List handler for reservation resources
 */

 async function list(req, res) {
  
  if(req.query.date){
    const reservation_date = req.query.date;
    console.log(reservation_date);
    const data = await service.list(reservation_date);
 }
  else if(req.query.id){
    const reservation_id = req.query.id;
    const data = await service.read(reservation_id);
  }
  res.json({ data });
}
/*
*OPTION ONE
const {data} = req.query; 
const data = await service.list(date);
res.json({data});
*OPTION TWO
const query = req.query; 
const data = await service.list(query);
res.json({data})
*OPTION THREE
const data = await service.list(req.query.date);
res.json({data})
*OPTION FOUR
const reservation_date = req.query.date; 
const data = await service.list(reservation_date);
res.json({data})
*/

async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

//async function read(req, res) {}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [validateReservation, asyncErrorBoundary(create)],
};

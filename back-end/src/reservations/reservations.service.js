const knex = require("../db/connection");

// *OPTION ONE
function list(reservation_date) {
  return knex("reservations")
    .select("*")
    .where({ reservation_date })
    .orderBy("reservation_time", "asc");
  console.log(reservation_date);
}

function create(reservation_id) {
  return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then((newReservation) => newReservation[0]);
}

function read() {}

module.exports = { list, create, read };

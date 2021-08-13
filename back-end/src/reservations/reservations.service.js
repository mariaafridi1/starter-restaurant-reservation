const knex = require("../db/connection");
const tableName = "reservations";

function create(newReservation) {
  return knex(tableName).insert(newReservation).returning("*");
}

async function list(reservation_date) {
  return knex(tableName)
    .where({ reservation_date: reservation_date })
    .whereNot("status", ["finished", "cancelled"])
    .orderBy("reservation_time");
}

// function list(reservation_date) {
//   if (!reservation_date) {
//     return knex(tableName)
//       .select("*")
//       .orderBy("reservation_date", "asc")
//       .orderBy("reservation_time", "asc");
//   } else {
//     return knex(tableName)
//       .select("*")
//       .orderBy("reservation_time", "asc")
//       .where("reservation_date", reservation_date)
//       .whereNot("status", "finished")
//       .whereNot("status", "cancelled");
//   }
// }

function search(mobile_number) {
  return knex(tableName)
    .whereRaw(
      "translate(mobile_number, '() -', '') line ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

async function read(reservation_id) {
  return knex(tableName).where({ reservation_id }).first();
}

async function update(updatedReservation) {
  return knex(tableName)
    .where({ reservation_id: updatedReservation.reservation_id })
    .update(updatedReservation, "*")
    .then(() => read(updatedReservation.reservation_id));
}

module.exports = {
  create,
  list,
  search,
  read,
  update,
};

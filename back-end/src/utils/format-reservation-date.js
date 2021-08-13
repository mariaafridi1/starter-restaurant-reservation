const { formatAsDate, asDateString } = require("./date-time");

function formatDate(date) {
  return formatAsDate(asDateString(date));
}

/**
 * Formats the reservation_date property of a reservation.
 * @param reservations
 *  a single reservation, or an array of reservations.
 * @returns {[reservation]|reservation}
 *  the specified reservation(s) with the reservation_date property formatted as YYYY-MM-DD.
 */
function formatReservationDate(reservations) {
  return Array.isArray(reservations)
    ? reservations.map(formatDate)
    : formatDate(reservations);
}
module.exports = { formatReservationDate };

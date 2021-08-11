const CLOSED_DAYS = [2];

function convertTimeToMin(time) {
  const result = time.split(":").map((part) => parseInt(part));
  return result[0] * 60 + result[1];
}

function isFutureDate({ reservation_date, reservation_time }) {
  if (new Date(`${reservation_date}T${reservation_time}`) < new Date()) {
    return new Error("Reservation date/time must be a future date");
  }
}

function isOpenOnDay({ reservation_date }) {
  const day = new Date(reservation_date).getUTCDay();
  if (CLOSED_DAYS.includes(day)) {
    return new Error("The restaurant is closed on Tuesday");
  }
}
function isOpenAtTime({ reservation_time }) {
  const reservationTime = convertTimeToMin(reservation_time);
  if (reservationTime < 630 || reservationTime > 1290) {
    return new Error("Please select a time between 10;30 and 21:30");
  }
}
export default function validate(reservation) {
  return [
    isFutureDate(reservation),
    isOpenOnDay(reservation),
    isOpenAtTime(reservation),
  ].filter((error) => error !== undefined);
}

import React from "react";
import { useHistory } from "react-router-dom";
import { changeReservationStatus } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

const ReservationsDisplay = ({ reservations, reservationsError }) => {
  const history = useHistory;
  const abortController = new AbortController();

  const listReservations = reservations.map((reservation) => {
    const {
      reservation_id,
      first_name,
      last_name,
      mobile_number,
      reservation_date,
      reservation_time,
      people,
      status,
    } = reservation;
    const readableTime = new Date(
      `${reservation_date} ${reservation_time}`
    ).toLocaleTimeString();

    const handleCanceledReservation = async () => {
      const result = await changeReservationStatus(
        reservation_id,
        "cancelled",
        abortController.signal
      );
      console.log(result, `LAST TEST`);
      history.back();
      // return () => abortController.abort;
    };
    return (
      <tr key={reservation_id}>
        <td>{reservation_id}</td>
        <td>{first_name}</td>
        <td>{last_name}</td>
        <td>{mobile_number}</td>
        <td>{readableTime}</td>
        <td>{people}</td>
        <td data-reservation-id-status={reservation_id}>{status} </td>
        <td>
          {status === "booked" ? (
            <a href={`/reservations/${reservation_id}/seat`}>
              <button
                className="btn btn-light btn-outline-primary"
                type="button"
              >
                Seat
              </button>
            </a>
          ) : null}
        </td>
        <td>
          {status === "booked" ? (
            <a href={`/reservations/${reservation_id}/edit`}>
              <button
                className="btn btn-light btn-outline-primary"
                type="button"
              >
                Edit
              </button>
            </a>
          ) : null}
        </td>
        <td>
          {status === "booked" ? (
            <button
              className="btn btn-light btn-outline-danger"
              type="button"
              data-reservation-id-cancel={reservation_id}
              onClick={() => {
                const confirmation = window.confirm(
                  `"Do you want to cancel this reservation?"`
                );
                if (confirmation) handleCanceledReservation();
                // return confirmation ? await handleCanceledReservation() : null;
              }}
            >
              Cancel
            </button>
          ) : null}
        </td>
      </tr>
    );
  });
  return (
    <>
      <ErrorAlert error={reservationsError} />
      <table className="table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">First Name</th>
            <th scope="col">Last Name</th>
            <th scope="col">Mobile Number</th>
            <th scope="col">Time</th>
            <th scope="col">People</th>
            <th scope="col">Status</th>
            <th scope="col">Seat Table</th>
            <th scope="col">Edit</th>
            <th scope="col">Cancel</th>
          </tr>
        </thead>
        <tbody>{listReservations}</tbody>
      </table>
    </>
  );
};
export default ReservationsDisplay;

import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationForm from "./ReservationForm";
import { createReservation } from "../utils/api";
import { formatAsDate } from "../utils/date-time";

const NewReservation = () => {
  const initialState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  };
  const history = useHistory();
  const [error, setError] = useState(null);
  const [reservation, setReservation] = useState(initialState);

  function submitHandler(e) {
    e.preventDefault();
    const abortController = new AbortController();
    setError(null);
    createReservation(reservation, abortController.signal)
      .then((savedReservation) => {
        history.push(
          `/dashboard?date=${formatAsDate(reservation.reservation_date)}`
        );
      })
      .catch(setError);
    return () => abortController.abort();
  }

  function cancelHandler() {
    history.goBack();
  }
  return (
    <main>
      <h1>New Reservation</h1>
      <ErrorAlert error={error} />
      <ReservationForm
        reservation={reservation}
        setReservation={setReservation}
        submitHandler={submitHandler}
        cancelHandler={cancelHandler}
      />
    </main>
  );
};

export default NewReservation;

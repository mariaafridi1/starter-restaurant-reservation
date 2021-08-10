import React, { useState } from "react";
import ReservationsDisplay from "../reservations/ReservationsDisplay";
import { listReservations } from "../utils/api";

const SearchByMobileNum = () => {
  const [mobile_number, setMobileNumber] = useState(null);
  const [results, setResults] = useState([]);
  const [reservationError, setReservationError] = useState(null);
  const [displayResults, setDisplayResults] = useState(false);

  const formChangeHandler = ({ target }) => {
    setMobile_number(target.value);
  };

  async function listResults() {
    const abortController = new AbortController();
    await listReservations(
      { mobile_number: mobile_number },
      abortController.signal
    )
      .then(setResulsts)
      .catch(setReservationError);
    return () => abortController.abort();
  }
  const submitHandler = async (e) => {
    e.preventDefault();
    await listResults();
    setDisplayResults(true);
  };

  return (
    <main>
      <h1>SEARCH</h1>
      <form onSubmit={submitHandler}>
        <div className="row mt-3">
          <div className="col-6 form-group">
            <input
              className="form-control"
              id="mobile_number"
              name="mobile_number"
              type="tel"
              calue={mobile_number}
              onChange={formChangeHandler}
              placeholder="Enter your phone number"
              required
            />
          </div>
          <div className="col-6 form-group">
            <button className="btn btn-primary" type="submit">
              Find
            </button>
          </div>
        </div>
      </form>
      {displayResults ? (
        results.length ? (
          <ReservationsDisplay
            reservations={results}
            reservationsError={reservationsError}
          />
        ) : (
          <h4>No reservations found</h4>
        )
      ) : null}
    </main>
  );
};

export default SearchByMobileNum;

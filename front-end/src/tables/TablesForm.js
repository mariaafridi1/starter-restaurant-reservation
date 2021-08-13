import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

const TableForm = ({ setTables }) => {
  const initialFormData = {
    table_name: "",
    capacity: "",
  };

  const history = useHistory;
  const [formData, setFormData] = useState({ ...initialFormData });
  const [error, setError] = useState(null);
  const abortController = new AbortController();

  function formChangeHandler({ target: { name, value } }) {
    console.log(name, value, "!!!!!!!!!");
    setFormData((previousTable) => ({
      ...previousTable,
      [name]: value,
    }));
  }

  const validateFields = () => {
    let foundError = [];

    if (formData.table_name === "") {
      foundError = { message: `Please fill out table name.` };
    } else if (!formData.capacity) {
      foundError = { message: `Please fill out table capacity.` };
    } else if (formData.table_name.length < 2) {
      foundError = { message: `Table name must be at least 2 characters.` };
    }
    setError(foundError);
    return foundError.length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (validateFields()) {
      await createTable(formData, abortController.signal);
      await listTables(abortController.signal).then(setTables);
      history.push(`/dashboard`);
      return () => abortController.abort();
    }
  };

  return (
    <main>
      <h1>Create New Table</h1>
      <form onSubmit={submitHandler}>
        <ErrorAlert error={error} />
        <div className="row mb-3">
          <div className="col-6 form-group">
            <label className="form-label" htmlFor="table_name">
              Table Name
            </label>
            <input
              className="form-control"
              id="table_name"
              name="table_name"
              type="text"
              minLength="2"
              value={formData.table_name}
              onChange={formChangeHandler}
              required
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-6 form-group">
            <label className="form-label" htmlFor="capacity">
              Capacity
            </label>
            <input
              className="form-control"
              id="capacity"
              name="capacity"
              type="number"
              aria-label="Table Capacity"
              max="12"
              min="1"
              value={formData.capactiy}
              onChange={formChangeHandler}
              required
            />
          </div>
        </div>
        <button className="btn btn-primary mx-1" type="submit">
          <span className="oi-oi-check" />
          Submit
        </button>
      </form>
    </main>
  );
};

export default TableForm;

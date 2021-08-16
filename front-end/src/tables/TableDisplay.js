import React from "react";
import { useHistory } from "react-router-dom";
import { freeTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

const TableDisplay = ({ tables, tablesError }) => {
  const history = useHistory();
  const abortController = new AbortController();

  const allTables = tables.map((table) => {
    const { table_id, table_name, capacity, reservation_id } = table;
    const finishedReservationHandler = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await freeTable(table_id, abortController.signal);
      history.go(0);
      return () => abortController.abort();
    };

    return (
      <tr key={table_id}>
        <td>{table_id}</td>
        <td>{table_name}</td>
        <td>{capacity}</td>
        <td data-table-id-status={table_id}>
          {reservation_id ? "occupied" : "free"}
        </td>
        <td>
          {reservation_id ? (
            <button
              className="btn btn-warning"
              type="button"
              data-table-id-finish={table_id}
              onClick={(e) => {
                const confirmation = window.confirm(
                  `Is this table ready to seat new guests? This cannot be undone.`
                );
                return confirmation ? finishedReservationHandler(e) : null;
              }}
            >
              Finish
            </button>
          ) : null}
        </td>
      </tr>
    );
  });
 
  return (
    <div>
      <ErrorAlert error={tablesError} />
      <table>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Table Name</th>
            <th scope="col">Capacity</th>
            <th scope="col">Status</th>
            <th scope="col">Reservation ID</th>
            <th scope="col">Finish</th>
          </tr>
        </thead>
        <tbody>{allTables}</tbody>
      </table>
    </div>
  );
};

export default TableDisplay;

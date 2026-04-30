import { useEffect, useState } from "react";
import "./index.css";

const App = () => {
  const [status, setStatus] = useState({ ok: false, message: "Checking..." });
  const [error, setError] = useState(false);

  useEffect(() => {
    // Bun and modern browsers have fetch built-in
    fetch(`${process.env.BUN_PUBLIC_BE_URL}/health`)
      .then((res) => {
        if (!res.ok) throw new Error("Server Down");
        return res.json();
      })
      .then((data) => setStatus(data))
      .catch(() => setError(true));
  }, []);
  return (
    <div className="container mt-5">
      <div
        className={`alert ${error ? "alert-danger" : "alert-success"} d-flex align-items-center`}
        role="alert"
      >
        {/* Bootstrap Icons or simple text for the status */}
        <div className="fw-bold">
          {error ? "System Error" : `Status: ${status.message}`}
        </div>
        <span className="ms-auto badge rounded-pill bg-light text-dark">
          {status.ok ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );
};

export default App;

import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <div>
      {token ? <Dashboard /> : <Login setToken={setToken} />}
    </div>
  );
}

export default App;
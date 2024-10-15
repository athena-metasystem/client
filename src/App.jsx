import { Router, Route } from "@solidjs/router";
import Workspace from "./pages/Workspace";
import axios from "axios";

const App = () => {
  axios.defaults.baseURL = "http://localhost:80/api";
  return (
    <Router>
      <Route path="/:id" component={Workspace} />
    </Router>
  );
};

export default App;

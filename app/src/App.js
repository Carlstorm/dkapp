import { createBrowserRouter, RouterProvider, } from "react-router-dom";
import './App.scss';

import Home from './pages/Home';
import PageLayout from './components/PageLayout';
import Rankings from './pages/Rankings';

const router = createBrowserRouter([
  {
    path: "/",
    element: <PageLayout />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/rankings",
        element: <Rankings />,
      }
    ]
  }
]);

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;

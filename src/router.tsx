import { createBrowserRouter } from "react-router-dom";
import Root from "./routes/root.tsx";
import App from "./routes/app";
import Home from "./routes/pages/Home/index.tsx";

/* eslint-enable react-refresh/only-export-components */

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        children: [
            {
                path: "*",
                element: <App />,
                children: [
                    {
                        index: true,
                        element: <Home />
                    },
                ],
            },
        ],
    },
]);

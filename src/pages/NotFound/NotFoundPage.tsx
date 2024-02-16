import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <div className="mt-3 text-center">
      <h1 className="mb-1 text-lg">404 - Page Not Found</h1>
      <p className="text-md mb-1">
        Oops! The page you are looking for does not exist.
      </p>
      <Link to="/">Go back to home</Link>
    </div>
  );
};

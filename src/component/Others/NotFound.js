import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set a timeout to navigate back to the "/user" page after 10 seconds
    const timeoutId = setTimeout(() => {
      navigate("/user");
    }, 10000);

    // Cleanup the timeout to avoid memory leaks
    return () => clearTimeout(timeoutId);
  }, [navigate]);

  return (
    <div className="error-area pt-5 pb-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <div className="error">
              <h1 className="display-1">404</h1>
              <h2 className="display-4">Oops! Page Not Found</h2>
              <p className="lead">
                Sorry, but the page you are looking for does not exist, has been
                removed, the name changed, or is temporarily unavailable.
              </p>

              <Link to={process.env.PUBLIC_URL + "/"} className="btn btn-primary">
                Back to Home Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

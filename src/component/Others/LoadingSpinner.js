import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const LoadingSpinner = () => {
  return (
    <div className="text-center mt-5">
      <FontAwesomeIcon icon={faSpinner} spin size="3x" />
    </div>
  );
};

export default LoadingSpinner;

import { ClipLoader } from "react-spinners";

/**
 * Small inline spinner — used inside buttons while a submit/action is in flight.
 */
const LoaderSpiner = ({ size = 18, color = "#ffffff" }) => {
  return <ClipLoader size={size} color={color} />;
};

export default LoaderSpiner;

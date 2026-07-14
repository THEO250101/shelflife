import PropTypes from 'prop-types';
import './ErrorBanner.css';

export default function ErrorBanner({ message }) {
  if (!message) {
    return null;
  }
  return <p className="error-banner">{message}</p>;
}

ErrorBanner.propTypes = {
  message: PropTypes.string,
};

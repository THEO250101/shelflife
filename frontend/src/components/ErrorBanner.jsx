import PropTypes from 'prop-types';
import './ErrorBanner.css';

export default function ErrorBanner({ message, tone = 'error' }) {
  if (!message) {
    return null;
  }

  const isSuccess = tone === 'success';
  return (
    <p
      className={`error-banner ${isSuccess ? 'success-banner' : ''}`}
      role={isSuccess ? 'status' : 'alert'}
      aria-live={isSuccess ? 'polite' : 'assertive'}
    >
      {message}
    </p>
  );
}

ErrorBanner.propTypes = {
  message: PropTypes.string,
  tone: PropTypes.oneOf(['error', 'success']),
};

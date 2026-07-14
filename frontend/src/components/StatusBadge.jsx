import PropTypes from 'prop-types';
import './StatusBadge.css';

export default function StatusBadge({ status }) {
  const tone = String(status || '')
    .toLowerCase()
    .replace(/\s+/g, '-');
  return <span className={`status-badge ${tone}`}>{status || 'Unsorted'}</span>;
}

StatusBadge.propTypes = {
  status: PropTypes.string,
};

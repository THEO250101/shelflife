import PropTypes from 'prop-types';
import './StatTile.css';

export default function StatTile({ label, value, tone, emoji }) {
  return (
    <div className={`stat-tile ${tone || ''}`}>
      <span className="stat-label">
        {emoji ? (
          <span className="stat-emoji" aria-hidden="true">
            {emoji}
          </span>
        ) : null}
        {label}
      </span>
      <strong>{value}</strong>
    </div>
  );
}

StatTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tone: PropTypes.string,
  emoji: PropTypes.string,
};

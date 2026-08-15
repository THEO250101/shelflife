import PropTypes from 'prop-types';
import './EmptyState.css';

export default function EmptyState({ emoji, title, children }) {
  return (
    <div className="empty-state" role="status">
      {emoji ? (
        <span className="empty-state-emoji" aria-hidden="true">
          {emoji}
        </span>
      ) : null}
      <h3 className="empty-state-title">{title}</h3>
      <p>{children}</p>
    </div>
  );
}

EmptyState.propTypes = {
  emoji: PropTypes.string,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

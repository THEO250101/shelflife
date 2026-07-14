import PropTypes from 'prop-types';
import './EmptyState.css';

export default function EmptyState({ emoji, title, children }) {
  return (
    <section className="empty-state">
      {emoji ? (
        <span className="empty-state-emoji" aria-hidden="true">
          {emoji}
        </span>
      ) : null}
      <strong>{title}</strong>
      <p>{children}</p>
    </section>
  );
}

EmptyState.propTypes = {
  emoji: PropTypes.string,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

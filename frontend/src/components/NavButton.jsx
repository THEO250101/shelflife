import PropTypes from 'prop-types';
import './NavButton.css';

export default function NavButton({ label, emoji, detail, active, onClick }) {
  return (
    <button type="button" className={active ? 'nav-button active' : 'nav-button'} onClick={onClick}>
      {emoji ? (
        <span className="nav-emoji" aria-hidden="true">
          {emoji}
        </span>
      ) : null}
      <span className="nav-label">{label}</span>
      {detail ? <small>{detail}</small> : null}
    </button>
  );
}

NavButton.propTypes = {
  label: PropTypes.string.isRequired,
  emoji: PropTypes.string,
  detail: PropTypes.string,
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

import PropTypes from 'prop-types';
import './PageHeader.css';

export default function PageHeader({ kicker, title, image, imageAlt, children }) {
  return (
    <header className="page-header">
      <div className="page-header-copy">
        <span>{kicker}</span>
        <h1>{title}</h1>
        {children ? <p>{children}</p> : null}
      </div>
      {image ? (
        <figure className="page-header-photo">
          <img src={image} alt={imageAlt || ''} />
        </figure>
      ) : null}
    </header>
  );
}

PageHeader.propTypes = {
  kicker: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  children: PropTypes.node,
};

import { forwardRef } from 'react';

/**
 * Button component. All clickable elements have cursor-pointer per UI/UX Pro Max rules.
 * No motion transforms — color/shadow transitions only.
 */
const Button = forwardRef(function Button(
  { children, variant = 'primary', size = '', full = false, icon: Icon, iconRight: IconRight, loading = false, className = '', ...props },
  ref
) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size && `btn-${size}`,
    full && 'btn-full',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button ref={ref} className={classes} disabled={loading || props.disabled} {...props}>
      {loading ? (
        <svg className="spinner-ai" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      ) : Icon ? (
        <Icon size={16} aria-hidden="true" />
      ) : null}
      {children}
      {!loading && IconRight ? <IconRight size={16} aria-hidden="true" /> : null}
    </button>
  );
});

export default Button;

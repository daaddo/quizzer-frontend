import React, { useId } from 'react'

const FloatingLabelInput = ({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  disabled,
  autoComplete,
  autoFocus,
  error,
  placeholder,
  className = '',
  wrapperClassName = '',
  endButton = null,
  ...rest
}) => {
  const generatedId = useId()
  const inputId = id || `${name || 'field'}-${generatedId}`

  return (
    <>
      <div className={`floating-group ${wrapperClassName} ${error ? 'has-error' : ''} ${endButton ? 'has-end-button' : ''}`}>
        <input
          id={inputId}
          name={name}
          type={type}
          className={`form-input floating-input ${className}`}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          placeholder={placeholder || label || ''}
          {...rest}
        />
        {label ? (
          <label htmlFor={inputId} className="floating-label">{label}</label>
        ) : null}
        {endButton}
      </div>
      {error ? (
        <div className="form-error" style={{ marginTop: '0.5rem' }}>{error}</div>
      ) : null}
    </>
  )
}

export default FloatingLabelInput



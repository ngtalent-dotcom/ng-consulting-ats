export default function StarRating({ value, onChange, disabled }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n === value ? 0 : n)}
          style={{
            background: 'none',
            border: 'none',
            padding: '2px 3px',
            fontSize: 22,
            cursor: disabled ? 'default' : 'pointer',
            color: n <= (value || 0) ? '#f59e0b' : '#e2e8f0',
            transition: 'color 0.1s',
            lineHeight: 1,
          }}
        >
          &#9733;
        </button>
      ))}
      {value > 0 && (
        <span style={{ fontSize: 12, color: '#94a3b8', alignSelf: 'center', marginLeft: 4 }}>
          {value}/5
        </span>
      )}
    </div>
  )
}

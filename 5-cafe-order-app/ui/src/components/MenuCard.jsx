import { useState } from 'react'
import { formatPrice } from '../utils/format'

export default function MenuCard({ item, onAddToCart }) {
  const [selected, setSelected] = useState(new Set())

  function toggleOption(optionId) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(optionId)) {
        next.delete(optionId)
      } else {
        next.add(optionId)
      }
      return next
    })
  }

  function handleAdd() {
    const options = item.options.filter((option) => selected.has(option.id))
    onAddToCart(item, options)
    setSelected(new Set())
  }

  const extraPrice = item.options
    .filter((option) => selected.has(option.id))
    .reduce((sum, option) => sum + option.price, 0)
  const displayPrice = item.price + extraPrice
  const isIce = item.name.includes('ICE')
  const isHot = item.name.includes('HOT')

  return (
    <article className="menu-card">
      <div className="menu-card__image">
        <img
          src={`https://images.unsplash.com/${item.imageId}?w=480&h=240&fit=crop&auto=format`}
          alt={item.name}
        />
        {(isIce || isHot) && (
          <span className={`menu-card__badge menu-card__badge--${isIce ? 'ice' : 'hot'}`}>
            {isIce ? 'ICE' : 'HOT'}
          </span>
        )}
      </div>

      <div className="menu-card__body">
        <div>
          <h3 className="menu-card__name">{item.name}</h3>
          <div className="menu-card__price-row">
            <span className={`menu-card__price${extraPrice > 0 ? ' menu-card__price--extra' : ''}`}>
              {formatPrice(displayPrice)}
            </span>
            {extraPrice > 0 && (
              <span className="menu-card__price-base">(기본 {formatPrice(item.price)})</span>
            )}
          </div>
        </div>

        <p className="menu-card__desc">{item.description}</p>

        <div className="menu-card__options">
          {item.options.map((option) => {
            const checked = selected.has(option.id)
            return (
              <label key={option.id} className="menu-card__option">
                <span className={`menu-card__check${checked ? ' menu-card__check--on' : ''}`}>
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 8 6" fill="none" aria-hidden="true">
                      <path
                        d="M1 3L3 5L7 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => toggleOption(option.id)}
                  />
                </span>
                <span>
                  {option.label}
                  <span className={`menu-card__option-price${option.price > 0 ? ' is-paid' : ''}`}>
                    {' '}
                    (+{option.price.toLocaleString()}원)
                  </span>
                </span>
              </label>
            )
          })}
        </div>

        <button type="button" className="menu-card__add" onClick={handleAdd}>
          담기
        </button>
      </div>
    </article>
  )
}

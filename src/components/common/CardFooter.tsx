import React from 'react';

interface CardFooterProps {
  price: number;
  priceLabel: string;
}

const CardFooter: React.FC<CardFooterProps> = ({ price, priceLabel }) => {
  return (
    <div className="px-5 sm:px-6 pb-5 sm:pb-6 mt-auto">
      <div className="flex items-center justify-between">
        <div>
          <div
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "1.3rem",
              fontWeight: 600,
              color: "var(--burgundy)",
            }}
          >
            ₹{price.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--mid)", fontWeight: 500 }}>
            {priceLabel}
          </div>
        </div>
        <button className="btn-gold !px-5 !py-2.5">Book Now</button>
      </div>
    </div>
  );
};

export default CardFooter;

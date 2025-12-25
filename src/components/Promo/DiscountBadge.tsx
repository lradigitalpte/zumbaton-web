"use client";

interface DiscountBadgeProps {
  type: 'referral' | 'early_bird';
  discount: number;
  className?: string;
}

export default function DiscountBadge({ type, discount, className = "" }: DiscountBadgeProps) {
  const isEarlyBird = type === 'early_bird';
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${className}`}
      style={{
        backgroundColor: isEarlyBird ? '#FEF3C7' : '#DBEAFE',
        color: isEarlyBird ? '#92400E' : '#1E40AF',
      }}
    >
      {isEarlyBird ? (
        <>
          <span>🎉</span>
          <span>Early Bird {discount}% OFF</span>
        </>
      ) : (
        <>
          <span>🎁</span>
          <span>Referral {discount}% OFF</span>
        </>
      )}
    </div>
  );
}


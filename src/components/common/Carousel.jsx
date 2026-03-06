import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Carousel = ({
  children,
  className = '',
  viewportClassName = '',
  itemClassName = '',
  step = 'viewport', // 'viewport' | number(px)
  showArrows = true,
  showGradient = true,
  ariaLabel = 'Carousel',
}) => {
  const viewportRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const items = useMemo(() => {
    const arr = Array.isArray(children) ? children : [children];
    return arr.filter(Boolean);
  }, [children]);

  const update = () => {
    const el = viewportRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft < maxScrollLeft - 2);
  };

  useEffect(() => {
    update();
    const el = viewportRef.current;
    if (!el) return;
    const onScroll = () => update();
    const onResize = () => update();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [items.length]);

  const scrollByAmount = (dir) => {
    const el = viewportRef.current;
    if (!el) return;
    const amount = step === 'viewport' ? el.clientWidth * 0.9 : Number(step) || 320;
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  return (
    <div className={`relative ${className}`} aria-label={ariaLabel}>
      {showGradient ? (
        <>
          <div
            className={`pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent transition-opacity ${
              canLeft ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            className={`pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent transition-opacity ${
              canRight ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      ) : null}

      {showArrows ? (
        <>
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            disabled={!canLeft}
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 border shadow-sm p-2 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            disabled={!canRight}
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 border shadow-sm p-2 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      ) : null}

      <div
        ref={viewportRef}
        className={`flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 ${viewportClassName}`}
        style={{
          scrollbarWidth: 'thin',
          overscrollBehaviorX: 'contain',
        }}
      >
        {items.map((node, idx) => (
          <div
            key={idx}
            className={`snap-start shrink-0 ${itemClassName}`}
            style={{ scrollSnapStop: 'always' }}
          >
            {node}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;


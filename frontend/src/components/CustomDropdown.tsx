import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';

export interface DropdownOption {
  value: string;
  label: string;
}

interface Props {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

const MENU_GAP = 9;
const MENU_MAX_HEIGHT = 288;
const VIEWPORT_PADDING = 16;

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = '\u2014 Select \u2014',
  className = '',
  id,
}: Props) {
  const [open, setOpen] = useState(false);
  const [menuStyles, setMenuStyles] = useState<CSSProperties>({});
  const [openUpward, setOpenUpward] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const handlePointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    const updateMenuPosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const availableBelow = window.innerHeight - rect.bottom - MENU_GAP - VIEWPORT_PADDING;
      const availableAbove = rect.top - MENU_GAP - VIEWPORT_PADDING;
      const shouldOpenUpward = availableBelow < 180 && availableAbove > availableBelow;
      const availableHeight = shouldOpenUpward ? availableAbove : availableBelow;
      const width = Math.min(rect.width, window.innerWidth - VIEWPORT_PADDING * 2);
      const maxLeft = Math.max(VIEWPORT_PADDING, window.innerWidth - VIEWPORT_PADDING - width);

      setOpenUpward(shouldOpenUpward);
      setMenuStyles({
        top: shouldOpenUpward ? rect.top - MENU_GAP : rect.bottom + MENU_GAP,
        left: Math.min(Math.max(rect.left, VIEWPORT_PADDING), maxLeft),
        width,
        maxHeight: Math.max(0, Math.min(MENU_MAX_HEIGHT, availableHeight)),
      });
    };

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open]);

  const choose = (option: DropdownOption) => {
    onChange(option.value);
    setOpen(false);
  };

  const menu =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={menuRef}
            className={`dropdown-menu dropdown-menu-portal${openUpward ? ' dropdown-menu-upward' : ''}`}
            role="listbox"
            style={menuStyles}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`dropdown-option${value === option.value ? ' dropdown-option-active' : ''}`}
                onClick={() => choose(option)}
                role="option"
                aria-selected={value === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={wrapperRef} className={`dropdown ${className}`} id={id}>
      <button
        ref={triggerRef}
        type="button"
        className={`dropdown-trigger${open ? ' dropdown-trigger-open' : ''}`}
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="dropdown-trigger-value">
          {selected ? selected.label : placeholder}
        </span>
      </button>

      {menu}
    </div>
  );
}

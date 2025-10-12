import { useRef } from 'react';
import { useControl } from '@conform-to/react/future';

import { Checkbox as ShadcnCheckbox } from '~/components/ui/checkbox.tsx';
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select.tsx';

interface SelectProps {
  id?: string;
  name: string;
  items: { name: string; value: string }[];
  placeholder: string;
  defaultValue?: string;
}

export function Select({
  name,
  items,
  placeholder,
  defaultValue,
  ...props
}: SelectProps) {
  const selectRef = useRef<React.ComponentRef<typeof SelectTrigger>>(null);
  const {
    value: selectedValue,
    register: registerSelectedFn,
    ...control
  } = useControl({
    defaultValue,
    onFocus() {
      selectRef.current?.focus();
    },
  });

  return (
    <>
      <input name={name} ref={registerSelectedFn} hidden />
      <ShadcnSelect
        value={selectedValue}
        onValueChange={(value) => control.change(value)}
        onOpenChange={(open) => {
          if (!open) {
            control.blur();
          }
        }}
      >
        <SelectTrigger {...props} ref={selectRef}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadcnSelect>
    </>
  );
}

interface CheckboxProps {
  id?: string;
  name: string;
  value?: string;
  defaultChecked?: boolean;
  className?: string;
  ['aria-describedby']?: string;
}

export function Checkbox({
  name,
  value,
  defaultChecked,
  className,
  ...props
}: CheckboxProps) {
  const checkboxRef = useRef<React.ComponentRef<typeof ShadcnCheckbox>>(null);
  const {
    checked: isChecked,
    register: registerCheckboxFn,
    ...control
  } = useControl({
    defaultChecked,
    value,
    onFocus() {
      checkboxRef.current?.focus();
    },
  });

  return (
    <>
      <input type="checkbox" ref={registerCheckboxFn} name={name} hidden />
      <ShadcnCheckbox
        {...props}
        ref={checkboxRef}
        checked={isChecked}
        onCheckedChange={(checked) => control.change(checked)}
        onBlur={() => control.blur()}
        className={`rounded focus:ring-2 focus:ring-stone-950 focus:ring-offset-2 ${className}`}
      />
    </>
  );
}

interface FieldErrorProps {
  id?: string;
  children: React.ReactNode;
}

export function FieldError({ id, children }: FieldErrorProps) {
  return (
    <div id={id} className="text-sm text-red-600">
      {children}
    </div>
  );
}

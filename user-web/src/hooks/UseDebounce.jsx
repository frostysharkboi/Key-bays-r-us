import { useState, useEffect } from "react";

export function useDebounce(value, delay = 500) { //delay w milisekundach
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay])

    return debouncedValue;
}
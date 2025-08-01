import * as React from "react";

export function useMediaQuery(query: string) {
  const [value, setValue] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => {
      setValue(mql.matches);
    };
    mql.addEventListener("change", onChange);
    setValue(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return !!value;
} 
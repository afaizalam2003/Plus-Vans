import Image from "next/image";
import { useTheme } from "next-themes";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  width = 120,
  height = 40,
  className = "",
}) => {
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === "dark" ? "/logo_dark.png" : "/logo_light.png";

  return (
    <Image
      src={logoSrc}
      alt="Logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
};

import { Sun, Cloud, CloudRain, CloudSnow, Wind, CloudLightning, Droplets } from 'lucide-react';

interface WeatherIconProps {
  condition: string;
  className?: string;
}

/**
 * Maps a weather condition string (as returned by the backend mock) to a
 * lucide icon. Replaces the emoji icon field from WeatherInfo so we never
 * render an emoji character in the UI.
 */
export function WeatherIcon({ condition, className = 'w-5 h-5' }: WeatherIconProps) {
  const c = condition.toLowerCase();

  if (c.includes('thunder') || c.includes('lightning') || c.includes('storm')) {
    return <CloudLightning className={className} aria-label={condition} />;
  }
  if (c.includes('snow') || c.includes('blizzard') || c.includes('sleet')) {
    return <CloudSnow className={className} aria-label={condition} />;
  }
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
    return <CloudRain className={className} aria-label={condition} />;
  }
  if (c.includes('wind') || c.includes('breezy') || c.includes('gust')) {
    return <Wind className={className} aria-label={condition} />;
  }
  if (c.includes('cloud') || c.includes('overcast') || c.includes('fog') || c.includes('mist')) {
    return <Cloud className={className} aria-label={condition} />;
  }
  if (c.includes('humid') || c.includes('damp')) {
    return <Droplets className={className} aria-label={condition} />;
  }
  // Default: sunny / clear
  return <Sun className={className} aria-label={condition} />;
}

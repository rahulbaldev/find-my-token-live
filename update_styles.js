const styles = {
  orange: {
    light: 'bg-gradient-to-br from-orange-400 to-amber-400',
    dark: 'bg-gradient-to-br from-orange-500 to-amber-600'
  },
  pink: {
    light: 'bg-gradient-to-br from-pink-400 to-rose-400',
    dark: 'bg-gradient-to-br from-pink-500 to-rose-600'
  },
  yellow: {
    light: 'bg-gradient-to-br from-amber-300 to-yellow-400',
    dark: 'bg-gradient-to-br from-amber-500 to-orange-500'
  },
  purple: {
    light: 'bg-gradient-to-br from-purple-400 to-indigo-400',
    dark: 'bg-gradient-to-br from-purple-500 to-indigo-600'
  },
  blue: {
    light: 'bg-gradient-to-br from-blue-400 to-cyan-400',
    dark: 'bg-gradient-to-br from-blue-500 to-cyan-600'
  },
  coral: {
    light: 'bg-gradient-to-br from-rose-400 to-red-400',
    dark: 'bg-gradient-to-br from-rose-500 to-red-600'
  },
  cyan: {
    light: 'bg-gradient-to-br from-cyan-400 to-teal-400',
    dark: 'bg-gradient-to-br from-cyan-500 to-teal-600'
  }
};

let output = 'const TICKET_STYLES: Record<TicketColor, TicketThemeStyle> = {\n';
for (const [color, themes] of Object.entries(styles)) {
  output += `  ${color}: {\n`;
  for (const theme of ['light', 'dark']) {
    output += `    ${theme}: {\n`;
    output += `      bg: '${themes[theme]}', border: 'border-white/10', dashedBorder: 'border-white/30',\n`;
    output += `      subtitleColor: 'text-white/90', numberColor: 'text-white',\n`;
    output += `      badgeBg: 'bg-black/30', badgeText: 'text-white', badgeBorder: 'border-transparent',\n`;
    output += `      reminderColor: 'text-white/80',\n`;
    output += `    },\n`;
  }
  output += `  },\n`;
}
output += '};';
console.log(output);

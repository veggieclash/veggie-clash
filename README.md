# 🥕 Veggie Clash

A family-friendly arcade shooter where vegetables battle it out in the garden! Play as the heroic **Carrot Commando** and defend against rogue vegetables in this fast-paced, browser-based game.

![Veggie Clash](https://img.shields.io/badge/Game-Veggie%20Clash-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Phaser](https://img.shields.io/badge/Phaser-3.70-purple.svg)
![Vite](https://img.shields.io/badge/Vite-4.x-646CFF.svg?logo=vite&logoColor=white)

## 🎮 Play Now

**[Play Veggie Clash →](https://username.github.io/veggie-clash/)**

## 🌟 Features

- **💯 Family-Friendly**: E/E10+ rated content with no gore, just veggie fun!
- **🎯 Twin-Stick Shooter**: WASD movement + mouse aiming for precision combat
- **📱 Mobile Support**: Virtual joystick and touch controls for mobile devices
- **⚡ Three Weapon Types**: Pea Shooter, Corn Cannon, and Beet Bazooka
- **🤖 Smart AI Enemies**: 4 unique enemy types with different behaviors
- **🏆 Two Game Modes**: Campaign and Survival Arena
- **✨ Juice & Polish**: Particles, screen shake, hit effects, and satisfying feedback
- **♿ Accessibility**: Color-blind safe, remappable controls, reduce motion toggle

## 🎯 Game Modes

### 🗺️ Campaign Mode
- **Level 1**: Garden Paths - Tutorial level with sparse cover
- **Level 2**: Greenhouse - Tight corridors and glass hazards
- **Boss Fight**: Face off against General Eggplant!

### ⚔️ Survival Arena
- Endless waves of enemies
- Increasing difficulty every minute
- Compete for high scores
- Elite enemy waves every 3 minutes

## 🥬 Meet the Enemies

| Enemy | Health | Speed | Special Ability |
|-------|--------|-------|-----------------|
| 🍅 **Tomato Trooper** | 20 | Medium | Lobs arcing projectiles |
| 🧅 **Onion Operative** | 15 | Fast | Rush attacks with wind-up |
| 🌶️ **Pepper Sniper** | 12 | Slow | Long-range laser beams |
| 🥦 **Broccoli Brute** | 40 | Slow | Area stomp attacks |
| 🍆 **General Eggplant** | 200 | Slow | Multi-projectile spread shots |

## 🔫 Weapons Arsenal

### 🟢 Pea Shooter (Default)
- **Damage**: 10 per shot
- **Fire Rate**: Fast
- **Ammo**: Infinite
- Perfect for crowd control

### 🌽 Corn Cannon
- **Damage**: 25 per shot
- **Fire Rate**: Medium
- **Ammo**: 30 shots
- Spread pattern for multiple hits

### 🥖 Beet Bazooka
- **Damage**: 50 per shot
- **Fire Rate**: Slow
- **Ammo**: 10 shots
- High damage with area effect

## 🎮 Controls

### 🖥️ Desktop
| Action | Key |
|--------|-----|
| **Move** | WASD |
| **Aim/Shoot** | Mouse |
| **Dash** | Space |
| **Switch Weapon** | Q/E or 1/2/3 |
| **Reload** | R |
| **Pause** | Esc |

### 📱 Mobile
- **Virtual Joystick**: Movement control
- **Shoot Button**: Auto-aim shooting
- **Dash Button**: Quick escape
- **Pause Button**: Menu access

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Modern web browser with WebGL support

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/username/veggie-clash.git
cd veggie-clash

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages (automatic via Actions)
git push origin main
```

## 🛠️ Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |
| `npm run lint` | Lint code |
| `npm run type-check` | Check TypeScript types |

## 📁 Project Structure

```
veggie-clash/
├── public/                 # Static assets
│   ├── audio/             # Sound effects & music
│   ├── images/            # Sprites & UI graphics
│   └── favicon.png
├── src/
│   ├── main.ts            # Game entry point
│   ├── styles/            # CSS styles
│   └── game/
│       ├── config.ts      # Game configuration
│       ├── scenes/        # Phaser scenes
│       ├── entities/      # Game objects
│       ├── systems/       # Game systems
│       └── data/          # Balance & level data
├── docs/                  # Built site (GitHub Pages)
└── .github/workflows/     # CI/CD automation
```

## ⚙️ Configuration & Tuning

### Weapon Balance
Edit `src/game/data/balance/weapons.json` to adjust:
- Damage values
- Fire rates
- Ammo counts

### Enemy Stats  
Edit `src/game/data/balance/enemies.json` to modify:
- Health and speed
- Attack patterns
- Spawn weights

### Game Settings
Modify `src/game/config.ts` for:
- Player stats
- World dimensions
- Performance settings

## 🎨 Asset Pipeline

The game uses procedurally generated placeholder graphics by default. To add custom assets:

1. **Sprites**: Place PNG files in `public/images/sprites/`
2. **UI Elements**: Add to `public/images/ui/`
3. **Audio**: MP3/OGG files in `public/audio/`
4. **Update PreloadScene**: Modify asset loading in `PreloadScene.ts`

### Recommended Asset Sizes
- **Player**: 32x48px
- **Enemies**: 32x32px to 64x80px
- **Projectiles**: 6x6px to 16x16px
- **UI Elements**: 200x50px (buttons)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with UI
npm run test:ui
```

Test files are located alongside source files with `.test.ts` extension.

## 🎯 Performance Optimization

- **Object Pooling**: Projectiles and enemies are pooled for performance
- **Texture Atlases**: Combine sprites to reduce draw calls
- **Level-of-Detail**: Particle limits scale with device capability
- **Mobile Optimization**: Reduced effects and lower resolution options

## 🌐 Browser Support

- **Chrome/Edge**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Mobile**: iOS 14+, Android 8+

## ♿ Accessibility Features

- **Color Blind Support**: High contrast and color-safe palette options
- **Remappable Controls**: Full keyboard customization
- **Reduced Motion**: Toggle for motion-sensitive users
- **Clear UI**: High contrast text and readable fonts
- **Mobile Friendly**: Large touch targets and responsive design

## 🚨 Troubleshooting

### Common Issues

**Game won't load**: Check browser console for errors, ensure WebGL is enabled
**Audio not working**: Click on game area to activate audio context
**Poor performance**: Try reducing particle effects in settings
**GitHub Pages 404**: Verify repository name matches `vite.config.ts` base path

### Performance Issues
1. Check `npm run build` output for bundle size
2. Enable hardware acceleration in browser
3. Close other browser tabs
4. Reduce graphics quality in settings

### Deployment Issues
1. Ensure `base` path in `vite.config.ts` matches repository name
2. Check GitHub Actions workflow status
3. Verify GitHub Pages is enabled in repository settings
4. Confirm all assets use relative paths

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`  
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Add JSDoc comments for public APIs
- Write tests for new features
- Maintain 60 FPS target performance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

- **Game Framework**: [Phaser 3](https://phaser.io/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Deployment**: [GitHub Pages](https://pages.github.com/)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions)

## 📈 Roadmap

- [ ] **Level Editor**: In-browser level creation tools
- [ ] **Power-up System**: More power-ups and effects
- [ ] **Achievements**: Unlock system with badges
- [ ] **Multiplayer**: Local co-op support
- [ ] **Sound System**: Full audio implementation
- [ ] **Localization**: Multi-language support

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/username/veggie-clash/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/username/veggie-clash/discussions)
- 📧 **Contact**: [email@example.com](mailto:email@example.com)

---

**Made with 🥕 and TypeScript**

*Ready to join the vegetable revolution? Let the garden warfare begin!*

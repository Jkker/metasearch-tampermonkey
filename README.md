# 🚀 Metasearch Tampermonkey

A customizable, themeable, and mobile-friendly search engine aggregator script for Tampermonkey that enhances your search experience across multiple platforms.

## 🌟 Features

- **Cross-Engine Navigation**: Displays a sleek bottom bar on search result pages with buttons for instantly searching across different engines
- **Full Customization**: Engines are easily customizable with support for reordering, custom icons, colors, and keyboard shortcuts
- **Mobile-First Design**: Responsive interface optimized for both desktop and mobile devices
- **Smart Theme Support**: Automatic dark/light mode detection with adaptive styling
- **Native App Integration**: Deep linking support for opening searches in native mobile apps
- **Flexible Matching**: Advanced URL matching system supporting strings, regular expressions, and custom functions
- **Intelligent Query Extraction**: Sophisticated query parameter parsing logic tailored for each search engine
- **Performance Optimized**: Lightweight, fast execution with zero external dependencies

## 🚀 Quick Start

### Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Click one of the installation links below:

- **[Install via Greasy Fork](https://greasyfork.org/en/scripts/451732-metasearch)** *(Recommended)*
- **[Install via GitHub](https://raw.githubusercontent.com/Jkker/metasearch-tampermonkey/main/dist/metasearch.iife.js)**

### Supported Search Engines

The script currently supports **25+ search engines** across various categories:

#### 🔍 **General Search**
- **Google**: Enhanced search with privacy parameters
- **Bing**: Microsoft's search engine
- **DuckDuckGo**: Privacy-focused search
- **Baidu (百度)**: China's leading search engine

#### 🎥 **Media & Social**
- **YouTube**: Video search with mobile app integration
- **Bilibili**: Chinese video platform
- **TikTok**: Short-form video content
- **X (Twitter)**: Social media search
- **Xiaohongshu (小红书)**: Chinese social commerce platform
- **Weibo (微博)**: Chinese microblogging platform
- **WeChat (微信)**: Chinese messaging platform

#### 🛒 **E-commerce**
- **Amazon**: Global marketplace
- **eBay**: Online auctions and marketplace
- **Taobao (淘宝)**: Chinese e-commerce platform
- **JD.com (京东)**: Chinese online retailer

#### 👥 **Communities & Q&A**
- **Reddit**: Social news aggregation
- **Zhihu (知乎)**: Chinese Q&A platform
- **Quora**: Question and answer platform

#### 💻 **Developer Resources**
- **GitHub**: Code repository search
- **MDN Web Docs**: Web development documentation

#### 🧮 **Utilities**
- **Wolfram Alpha**: Computational knowledge engine

*Each engine includes intelligent query parsing, mobile app deep linking (where applicable), and optimized search parameters.*

## ⌨️ Keyboard Shortcuts

Metasearch includes powerful keyboard navigation for desktop users:

- **`Alt + [` or `Alt + -`**: Navigate to previous search engine
- **`Alt + ]` or `Alt + =`**: Navigate to next search engine
- **`Alt + 1-9`**: Jump directly to search engine by position
- **`Alt + [letter]`**: Jump to search engine by first letter (e.g., `Alt + g` for Google)
- **`Escape`**: Remove focus from current search engine button
- **`Alt` (release)****: Activate the currently focused search engine

## 🎮 User Interface

### Desktop Experience
- **Horizontal scrollable bar** at the bottom of search pages
- **Mouse wheel support** for horizontal scrolling when hovering over the bar
- **Auto-hide on scroll down**, **show on scroll up** for distraction-free browsing
- **Customizable colors** that adapt to dark/light themes

### Mobile Experience
- **Touch-optimized buttons** with appropriate sizing
- **Deep linking support** for native app integration
- **Responsive layout** that works across all screen sizes

## 💻 Development

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or later)
- **pnpm** (package manager)

Clone the repository and install dependencies:

```bash
git clone https://github.com/Jkker/metasearch-tampermonkey.git
cd metasearch-tampermonkey
pnpm install
```

### Development Workflow

#### Building for Production
```bash
pnpm run build
```
Generates the production userscript in `/dist/metasearch.user.js`

#### Development Mode
```bash
pnpm run dev
```
Starts the development server with hot reload capabilities

#### Running Tests
```bash
pnpm run test
```
Executes the test suite using Vitest with browser testing

### Project Structure

```
metasearch-tampermonkey/
├── src/
│   ├── main.ts          # Main application logic
│   ├── config.ts        # Search engine configurations
│   ├── types.ts         # TypeScript type definitions
│   ├── style.css        # UI styling
│   └── utils/           # Utility functions
│       ├── getLightness.ts
│       ├── mediaQueries.ts
│       └── throttle.ts
├── dist/                # Built files
├── vite.config.ts       # Build configuration
└── package.json         # Project metadata
```

### Build Configuration

The build process uses Vite with the following plugins:
- **vite-plugin-monkey**: Generates Tampermonkey-compatible userscripts
- **CSS injection**: Inlines styles directly into the script
- **TypeScript compilation**: Full type checking and modern JS output

## 🎨 Customization

Metasearch is highly customizable through the `src/config.ts` file. You can modify the search engines, add new ones, or adjust existing configurations to suit your needs.

### Quick Configuration

Open `src/config.ts` and edit the `engines` array within the `config` object. Each engine is defined by an object implementing the `Engine` interface.

### Engine Configuration Reference

#### Core Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | `string` | ✅ | Display name for the search engine |
| `url` | `string` | ✅ | Search URL template with `%s` placeholder for queries |
| `hex` | `string` | ✅ | Foreground color in hex format (e.g., `#FF5733`) |
| `svg` | `string` | ✅ | SVG icon markup for the engine button |

#### Optional Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `slug` | `string` | `title[0]` | Unique identifier for keyboard shortcuts |
| `q` | `string` | `'q'` | Query parameter name for URL parsing |
| `site` | `string` | `undefined` | Site-specific search parameter |
| `disabled` | `boolean` | `false` | Hide engine from the interface |
| `mobile` | `Partial<Engine>` | `{}` | Mobile-specific overrides |

#### Advanced Properties

| Property | Type | Description |
|----------|------|-------------|
| `parse` | `RegExp \| ParseFn` | Custom logic for extracting queries from URLs |
| `format` | `FormatFn \| string` | Custom URL formatting for search queries |

### Example: Adding a Custom Search Engine

```typescript
{
  title: 'My Custom Engine',
  slug: 'custom',
  url: 'https://example.com/search?query=%s',
  hex: '#007ACC',
  svg: '<svg>...</svg>',
  q: 'query',
  mobile: {
    format: 'myapp://search?q=%s' // Deep link for mobile app
  }
}
```

### Mobile-Specific Configurations

Use the `mobile` property to override settings for mobile devices:

```typescript
{
  title: 'YouTube',
  url: 'https://www.youtube.com/results?search_query=%s',
  mobile: {
    format: 'youtube:///results?q=%s', // Opens in YouTube app
    url: 'https://m.youtube.com/results?search_query=%s'
  }
}
```

### Custom Parsing Logic

For complex URL structures, define custom parsing functions:

```typescript
{
  title: 'Complex Engine',
  parse: (url: URL) => {
    // Custom logic to extract search query
    const pathSegments = url.pathname.split('/');
    return pathSegments[2]; // Extract query from URL path
  },
  format: (query: string) => {
    // Custom URL generation
    return `https://example.com/search/${encodeURIComponent(query)}`;
  }
}
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help improve Metasearch:

### Ways to Contribute

- 🐛 **Report Bugs**: Found an issue? [Open a bug report](https://github.com/Jkker/metasearch-tampermonkey/issues/new?template=bug_report.md)
- 💡 **Suggest Features**: Have an idea? [Request a feature](https://github.com/Jkker/metasearch-tampermonkey/issues/new?template=feature_request.md)
- 🔧 **Submit Code**: Fix bugs or add features via pull requests
- 📚 **Improve Documentation**: Help enhance our docs and examples
- 🌐 **Add Search Engines**: Contribute new search engine configurations

### Development Guidelines

1. **Fork the repository** and create your feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes** following our coding standards:
   - Use TypeScript for type safety
   - Follow existing code style and conventions
   - Add JSDoc comments for public functions
   - Write tests for new functionality

3. **Test your changes** thoroughly:
   ```bash
   pnpm run test
   pnpm run build
   ```

4. **Commit your changes** with a descriptive message:
   ```bash
   git commit -m "feat: add support for new search engine"
   ```

5. **Push to your fork** and create a pull request:
   ```bash
   git push origin feature/amazing-feature
   ```

### Code Style

- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Write **clear, descriptive variable names**
- Add **JSDoc comments** for exported functions
- Keep functions **small and focused**

### Adding New Search Engines

When adding new search engines to `src/config.ts`:

1. **Research the search URL structure**
2. **Test query parameter parsing**
3. **Verify mobile app deep linking** (if applicable)
4. **Choose appropriate colors and icons**
5. **Test on actual search pages**

For major changes, please open an issue first to discuss your approach.

## 📜 License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/) - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Simple Icons](https://simpleicons.org/)** for providing the beautiful search engine icons
- **[Tampermonkey](https://www.tampermonkey.net/)** for enabling userscript functionality across browsers
- **[Vite](https://vitejs.dev/)** for the fast and modern build tooling

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Jkker/metasearch-tampermonkey/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/Jkker/metasearch-tampermonkey/discussions)
- 📧 **Email**: [j@erry.dev](mailto:j@erry.dev)

---

<div align="center">

**⭐ Star this project if you find it useful!**

Made with ❤️ by [Jkker](https://github.com/Jkker)

</div>

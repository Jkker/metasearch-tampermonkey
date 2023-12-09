# 🚀 Metasearch Tampermonkey

Customizable, themeable, mobile-friendly search engine aggregator script for Tampermonkey.

## 🌟 Features

- Displays a bar at the bottom of search engine result pages with buttons for searching on different engines.
- Buttons are customizable and can be reordered.
- Mobile-friendly, responsive design.
- Dark mode support with automatic theme detection.
- Optional deep linking for opening URLs in native apps on mobile.
- Flexible URL matching system, allowing strings, regular expressions, or custom functions.
- Powerful query parameter extraction logic for each search engine.
- Fast, lightweight, and dependency-free.

## 🚀 Usage

Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension, then click one of the links below to install the script:

- [Greasy Fork](https://greasyfork.org/en/scripts/451732-metasearch)
- [Github](https://raw.githubusercontent.com/Jkker/metasearch-tampermonkey/main/dist/metasearch.iife.js)

Currently, the script supports the following search engines:

- **Bing**: [https://www.bing.com/search?q=%s](https://www.bing.com/search?q=%s)
- **Google**: [https://www.google.com/search?igu=1&pws=0&gl=us&gws_rd=cr&source=hp&newwindow=1&q=%s&oq=%s&safe=off](https://www.google.com/search?igu=1&pws=0&gl=us&gws_rd=cr&source=hp&newwindow=1&q=%s&oq=%s&safe=off)
- **百度**: [https://www.baidu.com/s?ie=utf-8&word=%s](https://www.baidu.com/s?ie=utf-8&word=%s)
- **知乎**: [https://www.zhihu.com/search?type=content&q=%s](https://www.zhihu.com/search?type=content&q=%s)
- **bilibili**: [https://search.bilibili.com/all?keyword=%s](https://search.bilibili.com/all?keyword=%s)
- **小红书**: [https://www.xiaohongshu.com/search_result/?source=web_search_result_notes&keyword=%s](https://www.xiaohongshu.com/search_result/?source=web_search_result_notes&keyword=%s)
- **duckduckgo**: [https://duckduckgo.com/?q=%s&kaj=m&k1=-1&kn=1&kp=-2](https://duckduckgo.com/?q=%s&kaj=m&k1=-1&kn=1&kp=-2)
- **Reddit**: [https://www.google.com/search?q=%s+site%3Areddit.com](https://www.google.com/search?q=%s+site%3Areddit.com)
- **YouTube**: [https://www.youtube.com/results?search_query=%s](https://www.youtube.com/results?search_query=%s)
- **Github**: [https://github.com/search?q=%s](https://github.com/search?q=%s)
- **Wolfram**: [https://www.wolframalpha.com/input?i=%s](https://www.wolframalpha.com/input?i=%s)
- **微博**: [https://s.weibo.com/weibo?q=%s](https://s.weibo.com/weibo?q=%s)
- **有道**: [https://dict.youdao.com/result?word=%s&lang=en](https://dict.youdao.com/result?word=%s&lang=en)
- **Twitter**: [https://twitter.com/search?q=%s](https://twitter.com/search?q=%s)
- **Amazon**: [https://www.amazon.com/s?k=%s](https://www.amazon.com/s?k=%s)
- **eBay**: [https://www.ebay.com/sch/i.html?\_nkw=%s](https://www.ebay.com/sch/i.html?_nkw=%s)
- **京东**: [https://sou.m.jd.com/bases/m/searchKeyword.htm?keyword=%s](https://sou.m.jd.com/bases/m/searchKeyword.htm?keyword=%s)
- **淘宝**: [https://s.taobao.com/search?q=%s](https://s.taobao.com/search?q=%s)
- **MDN**: [https://developer.mozilla.org/en-US/search?q=%s](https://developer.mozilla.org/en-US/search?q=%s)

## 💻 Development

### Prerequisites

Clone the repository and install the dependencies:

```bash
git clone https://github.com/Jkker/metasearch-tampermonkey.git
cd metasearch-tampermonkey
pnpm install
```

### Building

To build the script, run the following command:

```bash
pnpm run build
```

The build process is configured in `vite.config.ts`. It includes two plugins: `libInjectCss` for CSS injection and `prependUserScriptHeader` for prepending a UserScript header.

## 🎨 Customization

Open `src/config.ts` and edit the `config` object to your liking. The `config` object is a map of search engine names to search engine objects. Each search engine object has the following properties:

### 📝 `Engine` Properties

#### `name`: string

The `name` property represents the name of the engine.

#### `url`: string

The `url` property specifies the URL associated with the engine.

#### `deeplink?`: string (optional)

The `deeplink` property is an optional URL scheme for opening the engine URL in native apps on mobile. If omitted, the `url` property is used instead.

#### `matcher?`: string | RegExp | ((url: string, query: URLSearchParams) => boolean) (optional)

The `matcher` property determines how the current URL matches the engine. It can be of type `string`, `RegExp`, or a `function`. The `undefined` value implies that the engine is skipped during matching. By default, it is `undefined`.

##### Variants:

- `string`: Matches if the URL contains the specified string.
- `RegExp`: Checks if the URL matches the regular expression.
- `function`: Returns `true` if the URL matches the function's criteria.

#### `q?`: string | string[] | RegExp | ((url: string, query: URLSearchParams) => string) (optional)

The `q` property represents the query parameter used for searching. It can be a `string`, `string[]`, `RegExp`, or a `function`. By default, it is set to `'q'`.

##### Variants:

- `string`: The query parameter is used as the search query.
- `string[]`: The first found query parameter is used as the search query.
- `RegExp`: The first matching query parameter is used.
- `function`: Calls the function with URL and query parameters, using the return value as the search query.

#### `key`: string

The `key` property is a unique ASCII string for identifying the engine and for keyboard shortcuts.

#### `icon`: string

The `icon` property defines the icon for the engine.

#### `color`: string

The `color` property specifies the foreground color for the engine.

#### `background?`: string (optional)

The `background` property, optional, defines the engine's background color.

#### `lightness?`: number (optional)

The `lightness` property, optional, determines the lightness of the engine, affecting the text color (dark or light). The default value is `0.5` or computed from the `color` property.

#### `priority`: number

The `priority` property signifies the engine's display priority. Higher values result in earlier display in lists. The default value is calculated as `index * 0.1`.

#### `disabled?`: boolean (optional)

The `disabled` property, if set to `true`, hides the engine from the list. By default, it is `false`.

### 📖 `Engine` Example

Below is an example of how to use the `Engine` interface:

```typescript
const searchEngine: Engine = {
  name: 'ExampleEngine',
  url: 'https://example.com',
  deeplink: 'example://search',
  matcher: (url) => url.includes('example.com'),
  q: 'query',
  key: 'example',
  icon: '<svg>...</svg>',
  color: '#FF5733',
  background: '#FFFFFF',
  lightness: 0.7,
  priority: 2,
  disabled: false,
};
```

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📜 License

[MIT](https://choosealicense.com/licenses/mit/)

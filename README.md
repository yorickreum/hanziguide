# HanziGuide

[![Website](https://img.shields.io/badge/website-hanzi.guide-blue)](https://hanzi.guide)

**HanziGuide** helps you learn to write Traditional and Simplified Chinese characters with proper stroke order. Study characters with clear, step-by-step animations and interactive practice tools.

## ✨ Features

- **Interactive Character Practice**: Learn to write Chinese characters with animated stroke-by-stroke demonstrations
- **Dual Script Support**: Switch between Simplified and Traditional Chinese characters
- **Multiple Languages**: Interface available in English, Simplified Chinese, and Traditional Chinese
- **Pronunciation Guides**: 
  - Mandarin Pinyin with tone marks
  - Cantonese Jyutping romanization
- **Practice Modes**: 
  - Watch animated stroke order demonstrations with adjustable animation speed
  - Draw characters stroke-by-stroke with real-time feedback
- **Share Characters**: Generate shareable links for specific characters
- **Stroke Matching Visualizer**: Advanced tool for analyzing character stroke data
- **Character Info**: View stroke count and character details

## 🚀 Getting Started

### Prerequisites

- Ruby (2.5 or later)
- Bundler (`gem install bundler`)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yorickreum/hanziguide.git
   cd hanziguide
   ```

2. **Install dependencies**:
   ```bash
   bundle install
   ```

3. **Download dictionary data**:
   ```bash
   ./scripts/fetch-dicts.sh
   ```

4. **Run the development server**:
   ```bash
   bundle exec jekyll serve
   ```

5. **View the site**: Open your browser and navigate to `http://localhost:4000`

## 🛠️ Technology Stack

- **Jekyll**: Static site generator
- **Hanzi Writer**: Character animation library by [chanind/hanzi-writer](https://github.com/chanind/hanzi-writer)
- **OpenCC**: Traditional/Simplified Chinese conversion
- **pinyin-pro**: Mandarin pronunciation support
- **to-jyutping**: Cantonese pronunciation support
- **Bootstrap**: UI framework
- **jQuery**: DOM manipulation
- **Font Awesome**: Icons

## 📁 Project Structure

```
hanziguide/
├── _config.yml              # Jekyll configuration
├── _data/
│   └── translations.yml     # Multi-language translations
├── _includes/
│   ├── practice.html        # Main practice interface
│   ├── head.html           # HTML head section
│   └── footer.html         # Footer section
├── _layouts/
│   ├── default.html        # English layout
│   ├── default.cn.html     # Simplified Chinese layout
│   └── default.zh-Hant.html # Traditional Chinese layout
├── assets/
│   ├── hzw_strokes.json    # Character stroke data
│   ├── js/
│   │   ├── index.js        # Main app logic
│   │   └── stroke_matching.js
│   └── cdn/                # Third-party libraries, hosted locally for privacy
├── css/
│   └── main.scss           # Styles
├── index.html              # Homepage
└── howto.html              # Tutorial page
```

## 🌐 Multi-Language Support

The site is available in three languages:
- **English**: [hanzi.guide](https://hanzi.guide)
- **简体中文**: [hanzi.guide/cn](https://hanzi.guide/cn)
- **繁體中文**: [hanzi.guide/tw](https://hanzi.guide/tw)

## 🎯 Usage Examples

### Learn Specific Characters

Navigate to the site and enter characters in the input field:
- Enter `你好` to learn "hello"
- The URL will update to allow sharing: `https://hanzi.guide/你好` or `https://hanzi.guide/#你好`

### Switch Between Scripts

Use the radio buttons to toggle between Simplified and Traditional Chinese characters.

### Practice Drawing

1. Check the "Draw next stroke" checkbox
2. Follow the stroke order animations
3. Draw on the character grid with your mouse or touch input

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the terms specified in [license.html](license.html).

## 👤 Authors

**袁霏篪 Fei Chi Kristy Yuen & Yorick Reum**
- Email: hanzi@yorickreum.de
- GitHub: [@kristyctyuen-droid]((ttps://github.com/kristyctyuen-droid), [@yorickreum](https://github.com/yorickreum)

## 🙏 Acknowledgments

- [Hanzi Writer](https://github.com/chanind/hanzi-writer) - The core character animation library
- All contributors to the open-source libraries used in this project

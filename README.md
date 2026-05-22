# 🏨 民宿・費用領受書/領収書ジェネレーター
### Multi-Lingual WYSIWYG Japanese Receipt & Invoice Generator

This is a premium, lightweight, standalone **What-You-See-Is-What-You-Get (WYSIWYG)** receipt generator tailored specifically for vacation rental (民宿 / 民泊) operators in Japan. It supports dynamic multi-language generation (Japanese, Simplified Chinese, Traditional Chinese, and English), automatic consumption tax calculations, compliance with Japan's **2023 Invoice System (インボイス制度)**, and an organic red square seal (角印/Hanko) generator.

---

## 🌟 Key Features

1. **100% Client-Side Privacy (数据绝对安全)**
   - Runs entirely in your local web browser. Your financial figures, guest reservation data, and client names never leave your computer.
2. **Professional Japanese Standard Formatting (专业的日本格式)**
   - Renders a formal standard Japanese receipt (領収書) with authentic double-borders, vertical layout components, dotted proviso line, and standard spacing.
3. **Japanese Invoice System Compliant (インボイス制度対応)**
   - Incorporates a taxable breakdown grid showing standard 10% tax rate base/amounts and registration numbers starting with "T" (適格簡易請求書 format). You can easily toggle this table ON or OFF.
4. **Interactive Multi-Language Switching (多语言一键切换)**
   - Instantly switch labels, currencies, and date formats between Japanese (日本語), Simplified Chinese (简体中文), Traditional Chinese (繁體中文), and English.
5. **Dynamic Japanese Hanko Stamp Generator (电子红印章生成器)**
   - Built-in canvas algorithm that renders an authentic-looking red square business seal (角印) dynamically. It orders characters vertically from right-to-left and adds micro-imperfections for a realistic stamped feel.

---

## 🚀 How to Launch on macOS

You have two extremely simple ways to open the tool:

### Method A: Direct Double-Click (Zero Setup)
Simply open the folder and **double-click the `index.html` file**. It will instantly open in your default browser. It has zero external dependencies and runs completely offline.

### Method B: Via Terminal Launcher (Recommended)
Open your terminal, navigate to this directory, and run the macOS launcher script:
```bash
./launch.sh
```
The launcher will ask whether you want to open the file directly (Option 1) or start a lightweight, private Python web server (Option 2) on `http://localhost:8000`.

### Method C: Online Access via GitHub Pages (Public Hosting)
Since you've made this repository public, you can deploy and access it directly online at:
👉 `https://cauchyds.github.io/InvoiceGenerator/`

*(To enable this, go to your GitHub repository -> Settings -> Pages -> Build and deployment -> Branch, choose `main` and click Save. All calculations and inputs remain 100% client-side and completely private!)*

---

## 🖨️ PDF Printing & Saving Recommendations

For a flawless visual output when saving to PDF or printing, please configure the standard browser printing options:

1. **Click the green button**: Click "Print / Save as PDF" at the bottom left.
2. **Paper Size & Orientation**:
   - **Destination**: Choose `Save as PDF` or your local printer.
   - **Layout/Orientation**: Select **Landscape (横向)**. (The sheet is formatted perfectly for A4 Landscape size).
   - **Paper Size**: Choose **A4**.
3. **Important Print Settings (More Settings / 更多设置)**:
   - **Margins (页边距)**: Select **None (无)** or **Default (默认)**. Selecting "None" ensures perfect vector alignment.
   - **Scale (缩放)**: Select **Default (100%)**.
   - **Headers and Footers (页眉和页脚)**: **Uncheck (取消勾选)**. This hides the URL and date text printed on the top and bottom of web page printouts.
   - **Background Graphics (背景图形)**: **Check (勾选)**. This ensures that the subtle gray borders and background styling print correctly.

---

## 📂 File Architecture

* **`index.html`** - HTML5 semantic UI structure and input grids.
* **`style.css`** - Custom premium vanilla CSS. Dark glassmorphic workspace + light professional A4 receipt.
* **`translations.js`** - Static localizations for JP, ZH_CN, ZH_TW, and EN.
* **`app.js`** - Reactivity engine, JPY consumption tax calculations, responsive viewport scaling, and virtual Hanko stamp drawing.
* **`launch.sh`** - Quick macOS shell script launcher.

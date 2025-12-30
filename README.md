# Microsoft Rewards Sat Set Bot

Automated bot to complete daily Microsoft Rewards tasks (PC & Mobile) using Puppeteer. This bot is designed with stealth mode to minimize the risk of detection.

## Features
- **PC & Mobile Search Automation**: Automatically completes daily search targets.
- **Stealth Mode**: Uses `puppeteer-extra-plugin-stealth` to hide automation traces.
- **Human-like Behavior**: Slow typing, random scrolling, and variable delays.
- **Session Saving**: Saves login sessions locally (`user_data`) so you don't need to log in again every time.

## Prerequisites
- [Node.js](https://nodejs.org/) (Latest version recommended).

## Installation

1.  Clone this repository or download the source code.
2.  Open a terminal/command prompt in the project folder.
3.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

1.  Run the bot:
    ```bash
    node index.js
    ```
2.  Chromium browser will open.
3.  **Manual Login (First Time Only)**:
    - The bot will pause and ask you to log in to your Microsoft account in the opened browser window.
    - Ensure you are on the "Points Breakdown" page or Rewards Dashboard.
    - Once logged in successfully, return to the terminal.
4.  Press **ENTER** in the terminal to start the automation process.
5.  The bot will read your point status and perform the necessary searches for PC and Mobile.
6.  Wait for completion.

## Data Security
The `user_data` folder will be created automatically to store your login session (cookies, local storage). **DO NOT SHARE THIS FOLDER** with anyone as it contains access credentials to your Microsoft account.

The `.gitignore` file is already set up to prevent the `user_data` folder from being accidentally uploaded to a git repository.

## Disclaimer
**USE AT YOUR OWN RISK.**
This bot is created solely for educational and experimental purposes. Using automation tools may violate Microsoft's Terms of Service.

The author is not responsible for any risks that may arise, including but not limited to:
- Microsoft account ban/suspension.
- Rewards points reset.
- Search restrictions.

Use this tool wisely and at your own risk.

## Development Ideas (For Developers)
For other developers who want to fork or continue this project, a highly recommended feature to add is **Proxy Support** (especially Residential Rotation Proxy).
Currently, the bot runs using a direct connection (ISP IP), which might be less secure if used intensively or for mass operations. Implementing proxies would greatly help mask traffic and improve account security in the long run.

## License
This project is licensed under the [MIT License](LICENSE).

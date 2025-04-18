<a href="https://www.framelink.ai/?utm_source=github&utm_medium=referral&utm_campaign=readme" target="_blank" rel="noopener">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://www.framelink.ai/github/HeaderDark.png" />
    <img alt="Framelink" src="https://www.framelink.ai/github/HeaderLight.png" />
  </picture>
</a>

<div align="center">
  <h1>Framelink Figma MCP Server</h1>
  <p>
    🌐 Available in:
    <a href="README.ko.md">한국어 (Korean)</a> |
    <a href="README.ja.md">日本語 (Japanese)</a> |
    <a href="README.zh.md">中文 (Chinese)</a>
  </p>
  <h3>Give your coding agent access to your Figma data.<br/>Implement designs in any framework in one-shot.</h3>
  <a href="https://npmcharts.com/compare/figma-developer-mcp?interval=30">
    <img alt="weekly downloads" src="https://img.shields.io/npm/dm/figma-developer-mcp.svg">
  </a>
  <a href="https://github.com/GLips/Figma-Context-MCP/blob/main/LICENSE">
    <img alt="MIT License" src="https://img.shields.io/github/license/GLips/Figma-Context-MCP" />
  </a>
  <a href="https://framelink.ai/discord">
    <img alt="Discord" src="https://img.shields.io/discord/1352337336913887343?color=7389D8&label&logo=discord&logoColor=ffffff" />
  </a>
  <br />
  <a href="https://twitter.com/glipsman">
    <img alt="Twitter" src="https://img.shields.io/twitter/url?url=https%3A%2F%2Fx.com%2Fglipsman&label=%40glipsman" />
  </a>
</div>

<br/>

Give [Cursor](https://cursor.sh/) and other AI-powered coding tools access to your Figma files with this [Model Context Protocol](https://modelcontextprotocol.io/introduction) server.

When Cursor has access to Figma design data, it's **way** better at one-shotting designs accurately than alternative approaches like pasting screenshots.

<h3><a href="https://www.framelink.ai/docs/quickstart?utm_source=github&utm_medium=referral&utm_campaign=readme">See quickstart instructions →</a></h3>

## Demo

[Watch a demo of building a UI in Cursor with Figma design data](https://youtu.be/6G9yb-LrEqg)

[![Watch the video](https://img.youtube.com/vi/6G9yb-LrEqg/maxresdefault.jpg)](https://youtu.be/6G9yb-LrEqg)

## How it works

1. Open your IDE's chat (e.g. agent mode in Cursor).
2. Paste a link to a Figma file, frame, or group.
3. Ask Cursor to do something with the Figma file—e.g. implement the design.
4. Cursor will fetch the relevant metadata from Figma and use it to write your code.

This MCP server is specifically designed for use with Cursor. Before responding with context from the [Figma API](https://www.figma.com/developers/api), it simplifies and translates the response so only the most relevant layout and styling information is provided to the model.

Reducing the amount of context provided to the model helps make the AI more accurate and the responses more relevant.

## Getting Started

Many code editors and other AI clients use a configuration file to manage MCP servers.

The `figma-developer-mcp` server can be configured by adding the following to your configuration file.

> NOTE: You will need to create a Figma access token to use this server. Instructions on how to create a Figma API access token can be found [here](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens).

### MacOS / Linux

```json
{
  "mcpServers": {
    "Framelink Figma MCP": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--figma-api-key=YOUR-KEY", "--stdio"]
    }
  }
}
```

### Windows

```json
{
  "mcpServers": {
    "Framelink Figma MCP": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "figma-developer-mcp", "--figma-api-key=YOUR-KEY", "--stdio"]
    }
  }
}
```

### Using SSE (HTTP Mode from Source)

If you want to run the server directly from the source code (e.g., for development or customization), you can connect via Server-Sent Events (SSE) over HTTP.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mmruesch12/Figma-Context-MCP.git
    cd Figma-Context-MCP
    ```
2.  **Install dependencies:**
    ```bash
    npm install 
    # or pnpm install / yarn install
    ```
3.  **Create environment file:** Create a file named `.env` in the root of the cloned repository and add your Figma API key:
    ```dotenv
    # .env
    FIGMA_API_KEY=YOUR-KEY
    ```
    *(You can also set the `PORT` variable here if you want to use a different port than the default `3333`)*
4.  **Start the development server:** This command starts the server in HTTP mode using `ts-node-dev` for automatic restarts on code changes.
    ```bash
    npm run dev
    ```
    The server will listen on `http://localhost:3333` by default.

5.  **Configure your MCP client:** Add the following configuration to your MCP settings file. This tells the client to connect to the running development server via its URL.

```json
{
  "mcpServers": {
    "Framelink Figma MCP (SSE)": {
      "url": "http://localhost:3333",
      "env": {
        "FIGMA_API_KEY": "YOUR-KEY" 
      }
    }
  }
}
```

> **Note:** When running the server via `npm run dev`, it reads the `FIGMA_API_KEY` from the `.env` file you created. The `env` block in the MCP client configuration below is primarily for the *client* to potentially authenticate with the server if needed, though in this setup, the server doesn't strictly require client-side key authentication as it already has the key from `.env`. However, including it can be good practice for consistency. Ensure `YOUR-KEY` matches the one in your `.env` file.

If you need more information on how to configure the Framelink Figma MCP server, see the [Framelink docs](https://www.framelink.ai/docs/quickstart?utm_source=github&utm_medium=referral&utm_campaign=readme).

## Star History

<a href="https://star-history.com/#GLips/Figma-Context-MCP"><img src="https://api.star-history.com/svg?repos=GLips/Figma-Context-MCP&type=Date" alt="Star History Chart" width="600" /></a>

## Learn More

The Framelink Figma MCP server is simple but powerful. Get the most out of it by learning more at the [Framelink](https://framelink.ai?utm_source=github&utm_medium=referral&utm_campaign=readme) site.

<!-- SPONSORS:LIST:START -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

## Sponsors

### 🥇 Gold Sponsors

<table>
  <tr>
   <td align="center"><a href="https://framelink.ai/?ref=framelink-mcp&utm_source=github&utm_medium=referral&utm_campaign=framelink-mcp"><img src="https://avatars.githubusercontent.com/u/204619719" width="180" alt="Framelink"/><br />Framelink</a></td>
  </tr>
</table>

### 🥈 Silver Sponsors

<table>
  <tr>
   <!-- <td align="center"><a href=""><img src="" width="150" alt="tbd"/><br />Title</a></td> -->
  </tr>
</table>

### 🥉 Bronze Sponsors

<table>
  <tr>
   <!-- <td align="center"><a href=""><img src="" width="120" alt="tbd"/><br />tbd</a></td>-->
  </tr>
</table>

### 😻 Smaller Backers

<table>
  <tr>
   <!-- <td align="center"><a href=""><img src="" width="100" alt="tbd"/><br />tbd</a></td>-->
  </tr>
  <tr>
   <!-- <td align="center"><a href=""><img src="" width="100" alt="tbd"/><br />tbd</a></td>-->
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- SPONSORS:LIST:END -->

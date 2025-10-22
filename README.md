# CogniFlow AI

An elegant, high-performance AI chat assistant for text and image generation, featuring advanced conversation management and a beautiful, customizable interface.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ahmedessmat2023-ctrl/generated-app-20251022-024325)

## About The Project

CogniFlow AI is a visually stunning, AI-powered conversational assistant built on a high-performance, serverless architecture using Cloudflare Workers. It provides a fluid and intuitive chat interface for interacting with a variety of advanced AI models for both text and image generation.

The application features a modern, responsive UI crafted with shadcn/ui and Tailwind CSS, focusing on an exceptional user experience with smooth animations and a polished design system. Key functionalities include robust chat history management, extensive user-configurable settings for personalization, and seamless multi-modal interactions.

### Key Features

*   **Conversational AI:** Engage in fluid, natural conversations with advanced AI models.
*   **Multi-Model Support:** Seamlessly switch between different text and image generation models.
*   **Stunning UI/UX:** A beautiful, modern interface built with shadcn/ui, Tailwind CSS, and Framer Motion for a polished user experience.
*   **High Performance:** Built on Cloudflare Workers and Durable Objects for a fast, scalable, and serverless backend.
*   **Conversation Management:** Organize your chats with session history, renaming, and deletion.
*   **Customization:** Personalize your experience with theme selection (light/dark) and other settings.
*   **Tool Integration:** The AI can leverage tools like web search and image generation to provide richer responses.

## Technology Stack

*   **Frontend:**
    *   [React](https://reactjs.org/)
    *   [Vite](https://vitejs.dev/)
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [shadcn/ui](https://ui.shadcn.com/)
    *   [Zustand](https://zustand-demo.pmnd.rs/) for state management
    *   [Framer Motion](https://www.framer.com/motion/) for animations
*   **Backend:**
    *   [Cloudflare Workers](https://workers.cloudflare.com/)
    *   [Hono](https://hono.dev/)
    *   [Durable Objects](https://developers.cloudflare.com/durable-objects/) for stateful agents
*   **AI Integration:**
    *   [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/)
    *   [Pollinations AI](https://pollinations.ai/) for image generation

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   [Bun](https://bun.sh/) package manager
*   A [Cloudflare account](https://dash.cloudflare.com/sign-up)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/cogniflow-ai-chat.git
    cd cogniflow-ai-chat
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Configure Cloudflare AI Gateway:**
    *   Open the `wrangler.jsonc` file.
    *   Locate the `vars` section.
    *   Replace `YOUR_ACCOUNT_ID` and `YOUR_GATEWAY_ID` with your actual Cloudflare account and AI Gateway details.
    *   Set your `CF_AI_API_KEY`. These variables are used server-side in the Worker and are not exposed to the client.
    ```json
    "vars": {
      "CF_AI_BASE_URL": "https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai",
      "CF_AI_API_KEY": "your-cloudflare-api-key"
    }
    ```

## Development

To run the application in development mode, which includes hot-reloading for both the frontend and the backend worker:

```sh
bun dev
```

This will start the Vite development server for the React frontend and a local `workerd` instance for the Cloudflare Worker. The application will be available at `http://localhost:3000`.

## Deployment

Deploy the application to your Cloudflare account with a single command. This will build the frontend, bundle the worker, and deploy everything to Cloudflare Pages.

1.  **Authenticate with Wrangler:**
    If this is your first time using Wrangler, you'll need to log in to your Cloudflare account.
    ```sh
    bunx wrangler login
    ```

2.  **Deploy the application:**
    ```sh
    bun run deploy
    ```

Alternatively, you can deploy directly from your GitHub repository using the button below.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ahmedessmat2023-ctrl/generated-app-20251022-024325)

## Project Structure

*   `src/`: Contains the frontend React application source code.
    *   `components/`: Reusable UI components, including shadcn/ui components.
    *   `pages/`: Main page components for the application.
    *   `lib/`: Utility functions, API clients, and state management stores.
    *   `hooks/`: Custom React hooks.
*   `worker/`: Contains the backend Cloudflare Worker source code.
    *   `agent.ts`: The core `ChatAgent` Durable Object class.
    *   `userRoutes.ts`: Hono API routes for session management.
    *   `chat.ts`: Handles AI model interaction and tool logic.
    *   `tools.ts`: Defines available tools for the AI model.
*   `wrangler.jsonc`: Configuration file for the Cloudflare Worker, including bindings and environment variables.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
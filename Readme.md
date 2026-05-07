# Real-time Messenger Project
A full-stack communication platform built with React, Node.js, Express, and Socket.io. The application enables real-time messaging capabilities through persistent bidirectional communication channels between clients and the server.

## Core Functionality
The platform supports instant message delivery and synchronization across multiple clients using web sockets. Users can join communication rooms or engage in direct messaging with real-time status updates. The backend manages active connections and ensures message delivery through an event-driven architecture, while the frontend provides a responsive interface for viewing and sending messages without page reloads.

### Technical Implementation
The system architecture is divided into a dedicated server and a client application. The server-side is built on Node.js and Express, utilizing Socket.io to handle WebSocket connections and event broadcasting. The client-side is developed with React, using the Socket.io client library to listen for incoming events and update the UI state dynamically. RESTful API endpoints are implemented for initial user authentication and message history retrieval.

### Project Structure 
The repository is organized into client and server folders to maintain a clear separation of concerns. The server directory contains middleware configurations, socket event handlers, and route definitions. The client directory includes React components, custom hooks for managing socket instances, and services for API communication.
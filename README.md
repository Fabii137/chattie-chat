# Chattie Chat

**Chattie Chat** is a personal project — a real-time chatting web application featuring friend lists, direct messages, group chats, and servers.

---

## Features

- **User Authentication**  
- Friend management: add, delete, accept/reject friend requests  
- Real-time messaging via WebSockets (Socket.IO)  
- Group chats and servers with multiple rooms  
- Online/offline presence status  
- Responsive UI with Angular Material  
- Notifications and chat actions  

---

## Tech Stack

| Layer    | Technology                           |
| -------- | ---------------------------------- |
| Backend  | NestJS, TypeORM, Socket.IO          |
| Frontend | Angular, Angular Material, Socket.IO Client |
| Database | MySQL                              |

---

## Architecture Overview

- **Backend:** REST API built with NestJS, handling user management, friend requests, rooms, and message persistence via TypeORM connected to MySQL. Real-time communication is powered by Socket.IO.  
- **Frontend:** Angular SPA with Material Design components for UI, integrating Socket.IO for live updates and chat interactions.  
- **Database:** MySQL stores users, friends, rooms, messages, and related entities.

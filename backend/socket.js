import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import User from "./models/User.js";

let io;

export const initSocket = (server) => {

    io = new Server(server, {
        cors: {
            origin: [
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175",
                "http://localhost:5176"
            ],
            methods: [
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE"
            ]
        }
    });

    // Socket authentication
    io.use(async (socket, next) => {

        try {

            const token =
                socket.handshake.auth?.token;

            if (!token) {

                return next(
                    new Error(
                        "Socket authentication required"
                    )
                );

            }

            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

            const user =
                await User.findById(
                    decoded.userId
                ).select("-password");

            if (!user) {

                return next(
                    new Error(
                        "User not found"
                    )
                );

            }

            // Store logged-in user
            // inside socket
            socket.user = user;

            next();

        } catch (error) {

            console.error(
                "Socket authentication error:",
                error.message
            );

            next(
                new Error(
                    "Socket authentication failed"
                )
            );

        }

    });

    io.on("connection", (socket) => {

        console.log(
            `Socket connected: ${socket.id}`
        );

        console.log(
            `User connected: ${socket.user.name}`
        );

        // Create private room
        const userRoom =
            `user:${socket.user._id}`;

        socket.join(userRoom);

        console.log(
            `Joined room: ${userRoom}`
        );

        socket.on("disconnect", () => {

            console.log(
                `Socket disconnected: ${socket.id}`
            );

        });

    });

    return io;
};

export const getIO = () => {

    if (!io) {

        throw new Error(
            "Socket.IO has not been initialized"
        );

    }

    return io;
};
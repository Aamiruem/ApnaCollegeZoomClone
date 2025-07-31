// import express from "express";
// import { createServer } from "node:http";

// import { Server } from "socket.io";

// import mongoose from "mongoose";
// import { connectToSocket } from "./controllers/socketManager.js";

// import cors from "cors";
// import userRoutes from "./routes/users.routes.js";

// const app = express();
// const server = createServer(app);
// const io = connectToSocket(server);


// app.set("port", (process.env.PORT || 8000))
// app.use(cors());
// app.use(express.json({ limit: "40kb" }));
// app.use(express.urlencoded({ limit: "40kb", extended: true }));

// app.use("/api/v1/users", userRoutes);

// const start = async () => {
//     app.set("mongo_user")
//     const connectionDb = await mongoose.connect("mongodb+srv://aamirhussainazad786:IXxu3SlrrRCTQNlg@cluster0.y3usvas.mongodb.net/zoom")

//     console.log(`MONGO Connected DB HOst: ${connectionDb.connection.host}`)
//     server.listen(app.get("port"), () => {
//         console.log("Server running on port", app.get("port"));
//     });



// }



// start();












import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);

// Set up socket.io
const io = connectToSocket(server); // Make sure this returns an instance of `io`

// App configuration
const PORT = process.env.PORT || 8000;
app.set("port", PORT);

// Middleware
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// Routes
app.use("/api/v1/users", userRoutes);

// Start the server and connect to MongoDB
const start = async () => {
    try {
        const connectionDb = await mongoose.connect("mongodb+srv://aamirhussainazad786:IXxu3SlrrRCTQNlg@cluster0.y3usvas.mongodb.net/zoom", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB connected: ${connectionDb.connection.host}`);

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to connect to MongoDB:", error.message);
        process.exit(1); // Exit with failure
    }
};

start();

import express from "express";
import cors from "cors";
import fs, { read } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const DB_FILE = path.join(__dirname, "database.json");
function readDB() {
    try {
        const data = fs.readFileSync(DB_FILE, "utf8");
        return JSON.parse(data || "[]");
    } catch {
        return [];
    }
}

function writeDB(data) { // DATA is written in the format [{ fullname: string, email: string, distance: float}]
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function clearDB() {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
        console.log("Database cleared successfully.");
    } catch (err) {
        console.error("Error clearing database:", err);
    }
}
app.post("/api/login", (req, res) => {
    const { fullname, email } = req.body;
    const data = readDB();
    var found = false
    for (let i = 0; i < data.length; i++) {
        if (data[i].email === email) {
            found = true;
            break;
        }
    }

    if (!found) {
        return res.json({ message: "Login successful", name: fullname });
    } else {

        return res.json({ message: "You have already guessed, please wait for the next location which can be seen on the board in the history corridor" });
    }

});

app.post("/api/makeGuess", (req, res) => {
    const { fullname, email, lat, lng } = req.body;

    let solFile;
    try {
        solFile = JSON.parse(fs.readFileSync(path.join(__dirname, "sol.json"), "utf8"));
    } catch (err) {
        console.error("Failed to read sol.json:", err);
        return res.status(500).json({ message: "Server error reading solution" });
    }

    const latSol = parseFloat(solFile.lat ?? solFile.latitude ?? solFile.latitud ?? solFile.Lat ?? solFile.latitude_deg);
    const lngSol = parseFloat(solFile.lng ?? solFile.long ?? solFile.longitude ?? solFile.lon ?? solFile.lang ?? solFile.Long);

    if (Number.isNaN(latSol) || Number.isNaN(lngSol)) {
        console.error("Invalid solution coordinates in sol.json:", solFile);
        return res.status(500).json({ message: "Invalid solution coordinates on server" });
    }

    // validate incoming guess coords
    const lat1 = parseFloat(lat);
    const lon1 = parseFloat(lng);
    if (Number.isNaN(lat1) || Number.isNaN(lon1)) {
        return res.status(400).json({ message: "Invalid guess coordinates" });
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    const distance = getDistanceFromLatLonInKm(lat1, lon1, latSol, lngSol);
    console.log(distance);
    const dbData = readDB();
    dbData.push({ fullname, email, distance });
    writeDB(dbData);

    return res.json({ message: "Guess received" });
});

app.post("/api/update-solution", (req, res) => {
    const { adminKey, lat, lng } = req.body;

    if (adminKey !== "quVpEy1QxK") {
        return res.status(403).json({ error: "Forbidden" });
    }

    if (typeof lat !== "number" || typeof lng !== "number") {
        return res.status(400).json({ error: "Invalid coordinates" });
    }

    fs.writeFileSync(path.join(__dirname, "sol.json"), JSON.stringify({ lat, lng }, null, 2));

    const db = readDB();
    if (!db || db.length === 0) {
        clearDB();
        return res.json({ message: "New coordinates saved. No guesses were made.", winner: null });
    }

    const winner = db.reduce((best, cur) => {
        const curDist = Number(cur.distance);
        return best === null || curDist < Number(best.distance) ? cur : best;
    }, null);

    clearDB();
    return res.json({
        name: winner.fullname,
        email: winner.email,
        distance: Number(winner.distance)
    });

});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

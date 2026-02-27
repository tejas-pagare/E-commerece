import jwt from "jsonwebtoken";
import Rider from "../models/Rider.js";

const verifyRider = async (req, res, next) => {
    try {
        const token = req.cookies.riderToken || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key_change_me");
        const rider = await Rider.findById(decoded.id);

        if (!rider) {
            return res.status(401).json({ success: false, message: "Unauthorized: Rider not found" });
        }

        if (rider.verificationStatus === 'Suspended') {
            return res.status(403).json({ success: false, message: "Account Suspended", reason: rider.suspensionReason });
        }

        req.rider = rider;
        next();
    } catch (error) {
        console.error("Rider Auth Error:", error);
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
};

export default verifyRider;

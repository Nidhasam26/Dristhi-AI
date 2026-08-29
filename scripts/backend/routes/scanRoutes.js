import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "../db.js";

const router = express.Router();

// ========================================
// UPLOAD DIRECTORY
// ========================================

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


// ========================================
// MULTER CONFIGURATION
// ========================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});


// ========================================
// FILE VALIDATION
// ========================================

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error("Only JPG, JPEG and PNG images are allowed"),
            false
        );
    }
};


const upload = multer({
    storage,
    fileFilter,

    limits: {
        fileSize: 10 * 1024 * 1024
    }
});


// ========================================
// CREATE RETINAL SCAN
// ========================================

router.post(
    "/upload",
    upload.single("retinal_image"),
    async (req, res) => {

        try {

            const {
                patient_id,
                eye
            } = req.body;

            // Validate patient
            if (!patient_id) {
                return res.status(400).json({
                    success: false,
                    message: "Patient ID is required"
                });
            }

            // Validate eye
            if (!eye) {
                return res.status(400).json({
                    success: false,
                    message: "Eye selection is required"
                });
            }

            // Validate image
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Retinal image is required"
                });
            }


            // Check patient exists
            const [patients] = await db.query(
                "SELECT id FROM patients WHERE id = ?",
                [patient_id]
            );

            if (patients.length === 0) {

                // Delete uploaded image
                fs.unlinkSync(req.file.path);

                return res.status(404).json({
                    success: false,
                    message: "Patient not found"
                });
            }


            // Save scan
            const imagePath = `/uploads/${req.file.filename}`;

            const [result] = await db.query(
                `INSERT INTO retinal_scans
                (
                    patient_id,
                    eye,
                    image_path,
                    ai_status
                )
                VALUES (?, ?, ?, 'PENDING')`,
                [
                    patient_id,
                    eye,
                    imagePath
                ]
            );


            res.status(201).json({

                success: true,

                message: "Retinal image uploaded successfully",

                scan: {
                    id: result.insertId,
                    patient_id,
                    eye,
                    image_path: imagePath,
                    ai_status: "PENDING"
                }

            });

        } catch (error) {

            console.error(
                "❌ Scan upload error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message: "Failed to upload retinal image"
            });
        }
    }
);


// ========================================
// GET ALL SCANS
// ========================================

router.get("/", async (req, res) => {

    try {

        const [scans] = await db.query(

            `SELECT
                rs.id,
                rs.patient_id,
                p.patient_code,
                p.name AS patient_name,
                rs.eye,
                rs.image_path,
                rs.image_quality,
                rs.quality_status,
                rs.dr_grade,
                rs.confidence,
                rs.risk_level,
                rs.ai_status,
                rs.created_at

             FROM retinal_scans rs

             INNER JOIN patients p
                ON rs.patient_id = p.id

             ORDER BY rs.created_at DESC`
        );


        res.json({
            success: true,
            data: scans
        });

    } catch (error) {

        console.error(
            "❌ Get scans error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch scans"
        });
    }
});


// ========================================
// GET SINGLE SCAN
// ========================================

router.get("/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const [scans] = await db.query(

            `SELECT
                rs.*,
                p.patient_code,
                p.name AS patient_name,
                p.age,
                p.gender,
                p.village,
                p.district

             FROM retinal_scans rs

             INNER JOIN patients p
                ON rs.patient_id = p.id

             WHERE rs.id = ?`,

            [id]
        );


        if (scans.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Scan not found"
            });
        }


        res.json({
            success: true,
            data: scans[0]
        });

    } catch (error) {

        console.error(
            "❌ Get scan error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch scan"
        });
    }
});


export default router;
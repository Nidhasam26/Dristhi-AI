import express from "express";
import db from "../db.js";

const router = express.Router();

// ========================================
// CREATE PATIENT
// ========================================

router.post("/", async (req, res) => {
    try {
        const {
            patient_code,
            name,
            age,
            gender,
            phone,
            village,
            district
        } = req.body;

        if (!patient_code || !name || !age || !gender) {
            return res.status(400).json({
                success: false,
                message: "Patient code, name, age and gender are required"
            });
        }

        const [existing] = await db.query(
            "SELECT id FROM patients WHERE patient_code = ?",
            [patient_code]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Patient code already exists"
            });
        }

        const [result] = await db.query(
            `INSERT INTO patients
            (patient_code, name, age, gender, phone, village, district)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                patient_code,
                name,
                age,
                gender,
                phone || null,
                village || null,
                district || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Patient registered successfully",
            patientId: result.insertId
        });

    } catch (error) {
        console.error("❌ Create patient error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to register patient"
        });
    }
});


// ========================================
// GET ALL PATIENTS
// ========================================

router.get("/", async (req, res) => {
    try {
        const [patients] = await db.query(
            `SELECT id, patient_code, name, age, gender,
                    phone, village, district, created_at
             FROM patients
             ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            data: patients
        });

    } catch (error) {
        console.error("❌ Get patients error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch patients"
        });
    }
});


// ========================================
// GET ONE PATIENT
// ========================================

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [patients] = await db.query(
            "SELECT * FROM patients WHERE id = ?",
            [id]
        );

        if (patients.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        res.json({
            success: true,
            data: patients[0]
        });

    } catch (error) {
        console.error("❌ Get patient error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch patient"
        });
    }
});


// ========================================
// UPDATE PATIENT
// ========================================

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            age,
            gender,
            phone,
            village,
            district
        } = req.body;

        const [result] = await db.query(
            `UPDATE patients
             SET name = ?,
                 age = ?,
                 gender = ?,
                 phone = ?,
                 village = ?,
                 district = ?
             WHERE id = ?`,
            [
                name,
                age,
                gender,
                phone || null,
                village || null,
                district || null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        res.json({
            success: true,
            message: "Patient updated successfully"
        });

    } catch (error) {
        console.error("❌ Update patient error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update patient"
        });
    }
});

export default router;
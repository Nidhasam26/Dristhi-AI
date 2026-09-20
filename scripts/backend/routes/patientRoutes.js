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
        let ownerUserId = null;
        if (req.get("x-user-role") !== "admin") {
            const [owners] = await db.query(
                "SELECT id FROM users WHERE LOWER(REPLACE(id, '_', '')) = LOWER(REPLACE(?, '_', ''))",
                [req.get("x-user-id")]
            );
            if (owners.length === 0) {
                return res.status(403).json({ success: false, message: "Authenticated user was not found" });
            }
            ownerUserId = owners[0].id;
        }

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
            (id, patient_code, user_id, name, age, gender, phone, village, district)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.body.id || patient_code,
                patient_code,
                ownerUserId,
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
        const isPatient = req.get("x-user-role") !== "admin";
        const userId = req.get("x-user-id");
        const where = isPatient
            ? "WHERE LOWER(REPLACE(user_id, '_', '')) = LOWER(REPLACE(?, '_', ''))"
            : "";
        const values = isPatient ? [userId] : [];
        const [patients] = await db.query(
            `SELECT id, patient_code, name, age, gender,
                    phone, village, district, user_id, created_at
             FROM patients
             ${where}
             ORDER BY created_at DESC`
            , values
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
        const isPatient = req.get("x-user-role") !== "admin";
        const userId = req.get("x-user-id");
        const ownership = isPatient
            ? " AND LOWER(REPLACE(user_id, '_', '')) = LOWER(REPLACE(?, '_', ''))"
            : "";
        const values = isPatient ? [id, userId] : [id];

        const [patients] = await db.query(
            `SELECT * FROM patients WHERE id = ?${ownership}`,
            values
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
        const isPatient = req.get("x-user-role") !== "admin";
        const userId = req.get("x-user-id");
        const ownership = isPatient
            ? " AND LOWER(REPLACE(user_id, '_', '')) = LOWER(REPLACE(?, '_', ''))"
            : "";
        const values = [name, age, gender, phone || null, village || null, district || null, req.params.id];
        if (isPatient) values.push(userId);

        const [result] = await db.query(
            `UPDATE patients
             SET name = ?,
                 age = ?,
                 gender = ?,
                 phone = ?,
                 village = ?,
                 district = ?
             WHERE id = ?${ownership}`,
            values
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

// ========================================
// DELETE PATIENT
// ========================================

router.delete("/:id", async (req, res) => {
    try {
        const isPatient = req.get("x-user-role") !== "admin";
        const userId = req.get("x-user-id");
        const ownership = isPatient
            ? " AND LOWER(REPLACE(user_id, '_', '')) = LOWER(REPLACE(?, '_', ''))"
            : "";
        const patientValues = isPatient ? [req.params.id, userId] : [req.params.id];

        const [ownedPatient] = await db.query(
            `SELECT id FROM patients WHERE id = ?${ownership}`,
            patientValues
        );
        if (ownedPatient.length === 0) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }

        await db.query(
            "DELETE FROM retinal_scans WHERE patient_id = ?",
            [req.params.id]
        );

        const [result] = await db.query(
            "DELETE FROM patients WHERE id = ?",
            [req.params.id]
        );

        res.json({
            success: true,
            deleted: result.affectedRows > 0
        });
    } catch (error) {
        console.error("❌ Delete patient error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to delete patient"
        });
    }
});

export default router;
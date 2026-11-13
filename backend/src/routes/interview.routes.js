
const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware");

const interviewRouter = express.Router();

// ==========================================
// DEBUG: CHECK MIDDLEWARE AND CONTROLLER
// ==========================================


// ==========================================
// 1. GENERATE INTERVIEW REPORT
// POST /api/interview
// ==========================================

interviewRouter.post(
    "/",
    authMiddleware.authUser,
    upload.single("resume"),
    interviewController.generateInterviewReportController
);

// ==========================================
// 2. GET INTERVIEW REPORT BY ID
// GET /api/interview/report/:interviewId
// ==========================================

interviewRouter.get(
    "/report/:interviewId",
    authMiddleware.authUser,
    interviewController.getInterviewReportByIdController
);

// ==========================================
// 3. GET ALL INTERVIEW REPORTS
// GET /api/interview
// ==========================================

interviewRouter.get(
    "/",
    authMiddleware.authUser,
    interviewController.getAllInterviewReportsController
);

// ==========================================
// 4. GENERATE RESUME PDF
// POST /api/interview/resume/pdf/:interviewReportId
// ==========================================

interviewRouter.post(
    "/resume/pdf/:interviewReportId",
    authMiddleware.authUser,
    interviewController.generateResumePdfController
);

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = interviewRouter;

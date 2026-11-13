
const { PDFParse } = require("pdf-parse");
const interviewReportModel = require("../models/interviewReport.model");

// Import the ES module service dynamically
const aiServicePromise = import("../services/ai.service.js");

// Generate interview report
async function generateInterviewReportController(req, res) {
    console.log("INTERVIEW CONTROLLER HIT");

    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a PDF resume."
            });
        }

        const parser = new PDFParse({
            data: new Uint8Array(req.file.buffer)
        });

        let resumeContent;

        try {
            resumeContent = await parser.getText();
        } finally {
            await parser.destroy();
        }

        const { selfDescription, jobDescription } = req.body;

        const aiService = await aiServicePromise;

        const interviewReportByAi = await aiService.default({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        });

        return res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        });

    } catch (error) {
        console.error("Interview report error:", error);

        return res.status(500).json({
            message: "Failed to generate interview report",
            error: error.message
        });
    }
}

// Get interview report by ID
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        return res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        });

    } catch (error) {
        console.error("Get report error:", error);

        return res.status(500).json({
            message: "Failed to fetch interview report",
            error: error.message
        });
    }
}

// Get all interview reports
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select(
                "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
            );

        return res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        });

    } catch (error) {
        console.error("Get all reports error:", error);

        return res.status(500).json({
            message: "Failed to fetch interview reports",
            error: error.message
        });
    }
}

// Generate resume PDF
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;

        // Get the named export from ai.service.js
        const aiService = await aiServicePromise;

        console.log("AI SERVICE EXPORTS:", Object.keys(aiService));
        console.log(
            "generateResumePdf type:",
            typeof aiService.generateResumePdf
        );

        const pdfBuffer = await aiService.generateResumePdf({
            resume,
            jobDescription,
            selfDescription
        });

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        });

        return res.send(pdfBuffer);

    } catch (error) {
        console.error("Resume PDF controller error:", error);

        return res.status(500).json({
            message: "Failed to generate resume PDF",
            error: error.message
        });
    }
}

module.exports = {
    generateInterviewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
};

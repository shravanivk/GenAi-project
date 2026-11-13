
import { GoogleGenAI, Type } from "@google/genai";
import * as z from "zod";
import puppeteer from "puppeteer";

// ==========================================
// 1. INITIALIZE GEMINI
// ==========================================

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const MODEL_NAME = "gemini-3.6-flash";
// ==========================================
// 2. INTERVIEW REPORT ZOD VALIDATION SCHEMA
// ==========================================

const interviewReportSchema = z.object({
    title: z.string(),

    matchScore: z.number().min(0).max(100),

    technicalQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string()
        })
    ).length(3),

    behavioralQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string()
        })
    ).length(3),

    skillGaps: z.array(
        z.object({
            skill: z.string(),
            severity: z.enum(["low", "medium", "high"])
        })
    ).length(3),

    preparationPlan: z.array(
        z.object({
            day: z.number(),
            focus: z.string(),
            tasks: z.array(z.string())
        })
    ).length(7)
});

// ==========================================
// 3. GEMINI INTERVIEW RESPONSE SCHEMA
// ==========================================

const geminiResponseSchema = {
    type: Type.OBJECT,

    properties: {
        title: {
            type: Type.STRING
        },

        matchScore: {
            type: Type.NUMBER
        },

        technicalQuestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    intention: { type: Type.STRING },
                    answer: { type: Type.STRING }
                },
                required: ["question", "intention", "answer"]
            }
        },

        behavioralQuestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    intention: { type: Type.STRING },
                    answer: { type: Type.STRING }
                },
                required: ["question", "intention", "answer"]
            }
        },

        skillGaps: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: { type: Type.STRING },
                    severity: {
                        type: Type.STRING,
                        enum: ["low", "medium", "high"]
                    }
                },
                required: ["skill", "severity"]
            }
        },

        preparationPlan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.NUMBER },
                    focus: { type: Type.STRING },
                    tasks: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ["day", "focus", "tasks"]
            }
        }
    },

    required: [
        "title",
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlan"
    ]
};

// ==========================================
// 4. RESUME PDF VALIDATION SCHEMA
// ==========================================

const resumePdfSchema = z.object({
    html: z.string().min(1)
});

// ==========================================
// 5. GEMINI RESUME RESPONSE SCHEMA
// ==========================================

const geminiResumeSchema = {
    type: Type.OBJECT,

    properties: {
        html: {
            type: Type.STRING
        }
    },

    required: ["html"]
};

// ==========================================
// 6. GENERATE INTERVIEW REPORT
// ==========================================

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {
    console.log("AI SERVICE FUNCTION CALLED");

    const prompt = `
You are an expert AI interview preparation assistant.

Analyze the candidate's resume, self-description,
and job description carefully.

Generate a detailed and personalized interview preparation report.

Follow these instructions:

1. Generate a meaningful and professional title.
2. Give a matchScore between 0 and 100.
3. Generate exactly 3 technical questions.
4. Generate exactly 3 behavioral questions.
5. Generate exactly 3 skill gaps.
6. Generate a 7-day preparation plan.
7. Every technical question must contain:
   question, intention and answer.
8. Every behavioral question must contain:
   question, intention and answer.
9. Every skill gap must contain:
   skill and severity.
10. Severity must be low, medium or high.
11. Every preparation plan item must contain:
    day, focus and tasks.
12. Tasks must be an array of strings.
13. Return JSON matching the provided response schema.
14. Make questions relevant to the candidate's resume
    and the given job description.

CANDIDATE RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription}

JOB DESCRIPTION:
${jobDescription}
`;

    try {
        console.log("Sending interview report request to Gemini...");

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: geminiResponseSchema
            }
        });

        const rawResponse = response.text;

        console.log("RAW GEMINI RESPONSE:", rawResponse);

        if (!rawResponse) {
            throw new Error("Gemini returned an empty response");
        }

        let result;

        try {
            result = JSON.parse(rawResponse);
        } catch (parseError) {
            console.error("JSON PARSE ERROR:", parseError.message);
            console.error("INVALID GEMINI RESPONSE:", rawResponse);

            throw new Error("Gemini returned invalid JSON");
        }

        const validatedResult = interviewReportSchema.parse(result);

        console.log("INTERVIEW REPORT VALIDATED SUCCESSFULLY");

        return validatedResult;

    } catch (error) {
        console.error("AI REPORT GENERATION ERROR:", error);
        throw error;
    }
}

// ==========================================
// 7. GENERATE RESUME PDF
// ==========================================


async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {
    console.log("RESUME PDF GENERATION STARTED");
    console.log("Extracted resume text length:", resume?.length || 0);

    if (!resume || !resume.trim()) {
        throw new Error("Resume text is empty. Please upload a valid PDF.");
    }

    const prompt = `
You are an expert professional resume writer and ATS resume designer.

Your task is to create a COMPLETE, detailed, professional,
ATS-friendly resume using the candidate's information.

================ CANDIDATE INFORMATION ================

ORIGINAL RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription || "Not provided"}

TARGET JOB DESCRIPTION:
${jobDescription || "Not provided"}

================ IMPORTANT RULES ================

1. Treat the ORIGINAL RESUME as the primary source of candidate information.

2. Preserve ALL relevant information from the original resume.
Do not unnecessarily remove, shorten, or ignore existing details.

3. Use the SELF DESCRIPTION only to improve the candidate's
professional summary and presentation.

4. Use the JOB DESCRIPTION to tailor the resume by highlighting
relevant existing skills and experience.

5. NEVER invent:
- Educational qualifications
- College names or grades
- Work experience
- Internship experience
- Projects
- Technical skills
- Certifications
- Achievements
- Dates or personal information

6. Include the following sections whenever the candidate's
provided information supports them:

- Candidate Name and Contact Information
- Professional Summary
- Technical Skills
- Education
- Work Experience
- Internships
- Projects
- Certifications
- Achievements
- Relevant Additional Information

7. Do not omit projects, education details, or work experience
that are already present in the original resume.

8. If a section has no supporting information, do not invent
content to fill it.

9. For projects, preserve available project names, technologies,
descriptions, and contributions.

10. For education, preserve available institution names,
degrees, dates, and grades.

================ HTML DESIGN REQUIREMENTS ================

1. Return a COMPLETE HTML document.
2. Use inline CSS inside a style tag.
3. Use a clean, modern, professional resume layout.
4. Use A4 page-friendly formatting.
5. Use readable fonts and consistent spacing.
6. Use dark blue or black section headings.
7. Use bullet points for skills, projects, and achievements.
8. Avoid tables, images, icons, charts, and unnecessary graphics.
9. Make the resume ATS-friendly and easy to read.
10. Keep the resume ideally 1-2 pages, but never remove important
candidate information just to meet the page limit.

================ OUTPUT FORMAT ================

Return a valid JSON object with exactly one property:

{
  "html": "<complete HTML document here>"
}

Return only valid JSON.
Do not use Markdown code fences.
`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: geminiResumeSchema
            }
        });

        const rawResponse = response.text;

        if (!rawResponse) {
            throw new Error("Gemini returned an empty resume response");
        }

        const parsedResponse = JSON.parse(rawResponse);

        const validatedResponse = resumePdfSchema.parse(parsedResponse);

        console.log("RESUME HTML GENERATED SUCCESSFULLY");
        console.log("Generated HTML length:", validatedResponse.html.length);

        const pdfBuffer = await generatePdfFromHtml(
            validatedResponse.html
        );

        console.log("RESUME PDF GENERATED SUCCESSFULLY");

        return pdfBuffer;

    } catch (error) {
        console.error("RESUME PDF GENERATION ERROR:", error);
        throw error;
    }
}


// ==========================================
// 8. CONVERT HTML INTO PDF USING PUPPETEER
// ==========================================

async function generatePdfFromHtml(html) {
    const browser = await puppeteer.launch({
        headless: true
    });

    try {
        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: "networkidle0"
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "15mm",
                bottom: "15mm",
                left: "15mm",
                right: "15mm"
            }
        });

        return Buffer.from(pdfBuffer);

    } finally {
        await browser.close();
    }
}

// ==========================================
// 9. EXPORT FUNCTIONS
// ==========================================

export default generateInterviewReport;

export {
    generateResumePdf
};

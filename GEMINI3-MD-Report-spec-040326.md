Technical Specification: MedReg Intel & Report Studio
Version: 1.0.0
Date: April 3, 2026
Status: Final Specification
Author: AI Build System
1. Executive Summary
The MedReg Intel & Report Studio is a state-of-the-art, AI-orchestrated platform designed to revolutionize how medical device manufacturers navigate the complex landscape of regulatory compliance, specifically focusing on the FDA Cybersecurity Guidance.
In an era where digital health is paramount, the burden of maintaining "Cybersecurity Transparency" and adhering to a "Secure Product Development Framework" (SPDF) has become a significant bottleneck for innovation. This platform addresses these challenges by providing a "WOW" grade user interface coupled with a sophisticated multi-agent AI pipeline. It enables users to transform raw regulatory news or internal device descriptions into comprehensive, audit-ready reports, gap analyses, and reusable AI skills.
The system leverages React 19, Tailwind CSS 4, and the Gemini 3.1 model family to deliver a high-performance, localized, and themeable experience. Its core value proposition lies in its ability to perform real-time web research, map evidence to regulatory requirements, and automate the tedious documentation process required for premarket submissions.
2. System Architecture & Technical Stack
2.1 Core Technologies
The application is built as a modern Single Page Application (SPA) with a focus on speed, type safety, and visual excellence.
Frontend Framework: React 19 (Stable). Utilizing the latest hooks and concurrent rendering features for a fluid UI.
Build Tool: Vite 6.2. Optimized for fast development and lean production bundles.
Styling Engine: Tailwind CSS 4.0. Leveraging the new @theme block and CSS variable-first architecture for dynamic styling.
AI Orchestration: Google GenAI SDK (@google/genai). Direct integration with Gemini 3.1 Flash Preview for low-latency, high-reasoning tasks.
Animations: motion/react (formerly Framer Motion). Used for layout transitions, sidebar toggles, and interactive dashboard elements.
Icons: Lucide-React. A consistent, accessible icon set for all UI actions.
Markdown Processing: react-markdown with remark-gfm. Ensures that AI-generated reports are rendered with professional formatting, including tables and task lists.
2.2 AI Model Configuration
The system defaults to gemini-3-flash-preview for its optimal balance of speed and reasoning.
Search Grounding: Enabled for the "Researcher" agent to ensure findings are backed by real-time web data.
System Instructions: Hardcoded within the agent logic to enforce "Expert Regulatory Consultant" personas.
Safety Settings: Configured to allow technical regulatory discussion while preventing the generation of harmful medical advice.
3. UI/UX Design Specification
3.1 The "WOW" Design Philosophy
The design follows a "Technical Editorial" aesthetic—combining the precision of a medical instrument with the readability of a high-end digital magazine.
3.2 Pantone Style Engine
One of the standout features is the Pantone Color Palette System. Instead of a single primary color, the app supports 10 distinct "Styles" based on iconic Pantone Colors of the Year:
Classic Blue (2020): Stability and confidence.
Living Coral (2019): Energy and optimism.
Ultra Violet (2018): Originality and ingenuity.
Greenery (2017): Freshness and revitalization.
Rose Quartz & Serenity (2016): Balance and peace.
Marsala (2015): Robustness and earthiness.
Radiant Orchid (2014): Creativity and joy.
Emerald (2013): Growth and prosperity.
Tangerine Tango (2012): Heat and adrenaline.
Implementation:
The system uses a data-style attribute on the <html> element. Tailwind 4 CSS variables are then updated dynamically:
code
CSS
[data-style="classic-blue"] { --primary: #0f4c81; }
.btn-primary { background-color: var(--primary); }
3.3 Theme & Localization
Dark Mode: A deep "Slate/Navy" palette (#0f172a) optimized for long-form reading and reduced eye strain.
Bilingual Support: Full UI localization between English and Traditional Chinese (繁體中文). This is critical for the Taiwan and Global medical device markets.
Jackslot Randomizer: A micro-interaction that allows users to "roll the dice" on their workspace style, adding a playful yet professional element to the workflow.
3.4 Layout Architecture
Persistent Sidebar: Collapsible navigation rail with active state indicators.
Glassmorphic Header: A blurred, semi-transparent header that provides context (active model, system health) without obstructing the view.
Live Log Footer: A terminal-style component that provides transparency into the AI's "thought process" and system operations.
4. Functional Module: MDRI Studio
The Medical Device Regulation Intelligence (MDRI) Studio is the heart of the application. It implements a linear, 3-step agentic workflow.
4.1 Step 1: The Web-Researched Summary
Agent Goal: Take a snippet of news or a device description and find the relevant regulatory context.
Input: Raw text (e.g., "New FDA guidance on AI in radiology").
Process: The agent invokes googleSearch. It filters for .gov, .edu, and official standards body domains.
Output: A 2000-3000 word Markdown document.
Key Feature: Grounding Metadata Extraction. The UI parses the groundingChunks from the Gemini response to create a "Web Research Sources" section with clickable links.
4.2 Step 2: The Regulation Report
Agent Goal: Synthesize the research into a formal report structure.
Input: The output from Step 1 + a selected Template.
Process: The agent maps the research findings to the specific headings of the FDA Cybersecurity Guidance (Quality System Considerations, Premarket Submissions, etc.).
Output: A 3000-4000 word professional report.
Logic: It uses the "Small Conclusion" (小結) and "References" (參考資料) sections from the template to ensure continuity.
4.3 Step 3: The Skill Architect
Agent Goal: Meta-programming.
Input: The final report.
Process: The agent analyzes the successful workflow and generates a skill.md file.
Output: A reusable prompt engineering document that can be used to "teach" other AI models how to perform this specific task with high accuracy.
5. Functional Module: Advanced AI Features
Beyond the linear workflow, the app provides three "On-Demand" analysis tools.
5.1 Regulatory Gap Analysis
This tool performs a "diff" between the user's device description and the "Gold Standard" of FDA cybersecurity expectations. It identifies missing controls (e.g., lack of SBOM, insufficient encryption) and provides a severity-coded table of gaps.
5.2 Cybersecurity Risk Matrix
A specialized agent that generates a risk assessment. It follows the ISO 14971 framework conceptually, identifying threats, vulnerabilities, and calculating "Pre-mitigation" vs "Post-mitigation" risk scores.
5.3 Premarket Submission Checklist
A practical tool for Regulatory Affairs (RA) professionals. It generates a step-by-step checklist of every document required for a 510(k) or De Novo submission under the new cybersecurity guidance, including the "Cybersecurity Management Plan" and "Security Risk Management Report."
6. Data Management & State
6.1 Artifact Versioning
The application treats every AI output as an "Artifact."
State Shape: Artifact[]
Properties: id, title, content, type, version, timestamp.
Persistence: Currently held in React state for the session. The architecture is ready for local-storage or Firestore integration.
6.2 Live Logging System
To maintain user trust, every background action is logged.
Log Types: info, success, warning, error, ai.
UI: A scrolling monospace view that automatically stays at the bottom, mimicking a real-time data stream.
7. Security & Privacy
7.1 API Key Handling
The application follows strict security protocols for API keys:
Environment Variables: Uses process.env.GEMINI_API_KEY injected via Vite.
No UI Exposure: There are no input fields for API keys in the UI, preventing accidental exposure in shared environments.
Server-Side Logic: While this is a client-side demo, the architecture supports a transition to a full-stack Express backend for key proxying.
7.2 Data Privacy
Client-Side Processing: All text processing and Markdown rendering happen in the user's browser.
No PII Storage: The application does not store user-pasted content on any external database by default.
8. Future Roadmap
PDF/OCR Integration: Adding the ability to upload scanned regulatory documents and perform Tesseract-based OCR before analysis.
Multi-Jurisdiction Support: Expanding beyond the FDA to include EU MDR/IVDR, Taiwan TFDA, and Japan PMDA templates.
Collaborative Review: Implementing a "Comments" system on artifacts for multi-user regulatory review.
Export to DOCX: Utilizing docx.js to allow one-click export of the 4000-word reports into editable Microsoft Word documents.
9. Conclusion
The MedReg Intel & Report Studio is more than just a tool; it is a force multiplier for regulatory teams. By combining high-end design with rigorous AI orchestration, it transforms the daunting task of cybersecurity compliance into a streamlined, interactive, and even "WOW" experience. It sets a new standard for how professional regulatory software should look, feel, and perform in the age of Generative AI.
10. 20 Comprehensive Follow-up Questions
Technical Architecture: How does the application handle the token limits of Gemini 3.1 when generating a 4000-word report in a single pass?
Search Grounding: What specific parameters are used in the googleSearch tool to ensure the AI doesn't hallucinate non-existent FDA guidance?
Pantone Engine: Could the Pantone style system be extended to allow users to upload their own corporate brand guidelines (HEX codes) for the UI?
Localization: How are medical-specific terms like "Premarket Submission" or "SaMD" handled in the Traditional Chinese translation to ensure regulatory accuracy?
Agentic Workflow: If Agent 1 (Summary) fails to find relevant web data, how does Agent 2 (Report) adapt its logic to avoid generating a generic response?
State Management: Would moving the Artifact state to a global store like Redux or Zustand improve performance when handling dozens of 4000-word documents?
Security: How can we implement a "Sanitization" layer to ensure that sensitive device IP is stripped before being sent to the Gemini API?
Performance: What is the average latency for the 3-step agent chain, and how can we use "Streaming" to show the user progress in real-time?
UX Design: How does the "Jackslot" feature impact user engagement metrics in a professional regulatory environment?
Markdown Rendering: Are there plans to support Mermaid.js diagrams within the reports to visualize the "Medical Device Connectivity Architecture"?
Skill Creation: How exactly does the skill.md generated in Step 3 differ from a standard system prompt, and how can it be tested for "Trigger Accuracy"?
FDA Guidance: Does the platform currently distinguish between "Draft Guidance" and "Final Guidance" in its web research phase?
Risk Matrix: Can the Risk Matrix tool be configured to use specific scoring systems like CVSS (Common Vulnerability Scoring System)?
Accessibility: Does the Pantone style system maintain WCAG 2.1 color contrast compliance across all 10 styles, especially in Dark Mode?
Error Handling: What happens if the Gemini API returns a "Safety Filter" block during the generation of a cybersecurity risk report?
Data Export: How difficult would it be to integrate a "PDF Export" feature that preserves the Pantone styling and typography of the web view?
Template Logic: Can users define "Conditional Sections" in their templates that only appear if the device is classified as Class III?
Web Search: How does the system handle "Paywalled" standards (like ISO/IEC) that are not freely available on the public web?
AI Features: Could a "Regulatory Chatbot" be added that allows users to ask questions specifically about the artifacts generated in the current session?
Scalability: How would the application handle a "Batch Mode" where 50 different device descriptions are processed into reports simultaneously?

Here’s a concise and professional summary and system workflow for your AI-Powered Quiz Generator and Assessment System, written in a way suitable for your Integrative Programming and Technologies 2 documentation or proposal:
System Title
AI-Powered Quiz Generator and Assessment System
System Description
The AI-Powered Quiz Generator and Assessment System is an online platform that enables teachers to automatically create quizzes using artificial intelligence. Teachers can upload learning materials such as PDF, Word, PowerPoint, or text files, and the system’s AI engine analyzes and summarizes the content to generate multiple-choice questions based on the uploaded material.
Each quiz is assigned a unique access code, allowing teachers to share it easily with students. When students enter the code on the web app, they gain access to the quiz portal, where the system provides randomized questions—ensuring each student receives a different set while maintaining the same correct answers.
The quiz includes a countdown timer and expiration date. Once the student submits or the timer runs out, the system automatically checks the answers, records the results, and sends the scores to the teacher. The teacher can view quiz analytics such as class average, highest and lowest scores, and individual student performance.
This system promotes academic integrity, saves preparation time, and provides a flexible, AI-driven way to assess students based on dynamic and content-relevant questions.
System Workflow
1. Teacher Workflow
Teacher logs into the system.
Uploads a learning material (PDF, PPT, DOCX, or link).
The system extracts key content, generates a summary, and creates AI-based multiple-choice questions.
Teacher sets:
Quiz title
Duration (timer)
Expiration date/time
Number of questions per student
System saves the quiz in the database and generates a unique quiz access code.
Teacher shares the code with students.
2. Student Workflow
Student accesses the quiz portal on the website.
Inputs school information and quiz code.
System validates the quiz (checks if active and not expired).
Student begins the quiz:
Timer starts automatically.
Questions are randomized from the quiz pool.
Upon submission or timer expiry, the system auto-grades the quiz.
Student receives score feedback (if enabled).
3. Result and Analytics Workflow
The backend computes student scores based on correct answers.
Results are stored in the database under submissions.
Teacher dashboard displays:
Individual student scores
Average performance
Question accuracy rates
Option to export results as PDF or Excel.
Technology Stack
Frontend: Next.js (React Framework)
Backend: Node.js with Express
Database: MongoDB (via Mongoose ORM)
AI Engine: NLP/LLM integration for text summarization and question generation
Authentication: Basic login for teachers; quiz-code access for students

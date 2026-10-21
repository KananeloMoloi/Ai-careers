# AI Career Navigator — Quality Assurance (QA)

## Overview

This document describes how to test **AI Career Navigator**, a React + Vite application with an Express API deployed using Netlify Functions. The app uses Groq to assess CV/job fit, retrieves listings from Remotive and Arbeitnow (with optional Adzuna integration), and supports job-specific CV tailoring with Word and PDF exports.

> **QA status:** Test plan only. The cases below have **not been executed or passed** as part of this document. Record actual results and evidence before declaring the application ready for release.

## QA objectives

- Confirm users can upload a supported CV and receive relevant, real job listings.
- Check country eligibility, related-role matching, and inclusion of remote, hybrid, on-site, part-time, full-time, contract and internship opportunities **where the providers supply them**.
- Confirm Groq-generated job matches and tailored CVs are handled safely and can be reviewed before export.
- Verify that Word and PDF downloads work and preserve reviewed information.
- Verify the frontend and API work together after Netlify deployment.
- Check validation, error messages, privacy, accessibility and responsiveness.

## Test environment

| Item | Configuration |
| --- | --- |
| Runtime | Node.js 22 |
| Frontend | React + Vite |
| API | Express; Netlify Function for deployment |
| AI | Groq (`GROQ_API_KEY`) |
| Job providers | Remotive, Arbeitnow; Adzuna if configured |
| Browsers | Chrome and Edge; test Firefox/mobile if available |
| Test data | Fictional, text-readable PDF CVs under 5 MB; sample job titles and countries |

### Local setup

From the repository root:

```bash
npm install
npm run install:all
```

Copy `server/.env.example` to `server/.env` and set `GROQ_API_KEY`. Optionally configure `GROQ_MODEL`, `ADZUNA_APP_ID`, and `ADZUNA_APP_KEY`. Never commit secrets.

```bash
npm run dev
```

Open `http://localhost:5173`. For deployment, connect the repository to Netlify; `netlify.toml` defines `npm run build`, `client/dist`, and `netlify/functions`. Add server-side API keys to Netlify environment variables. Check `/api/health` on the deployed domain.

## Functional test cases

Record **Pass / Fail / Blocked / Not Run**, actual result, date, and evidence for each case.

| ID | Scenario / steps | Expected result | Status |
| --- | --- | --- | --- |
| QA-01 | Open the home page | Page renders without fatal errors | Not Run |
| QA-02 | Upload a valid text-readable PDF CV | File accepted; user can proceed | Not Run |
| QA-03 | Submit without a CV | Clear validation message; no server crash | Not Run |
| QA-04 | Upload a non-PDF file | Upload rejected with understandable feedback | Not Run |
| QA-05 | Upload a PDF larger than 5 MB | Upload rejected with size guidance | Not Run |
| QA-06 | Upload a scanned/image-only PDF | User receives clear feedback if text cannot be extracted | Not Run |
| QA-07 | Enter a desired role and country | Search submits those inputs | Not Run |
| QA-08 | Search for a role with related titles | Results can include genuinely related roles, not just exact title matches | Not Run |
| QA-09 | Search with a CV lacking required skills | Fit explanations reflect actual CV evidence; no fabricated qualifications | Not Run |
| QA-10 | Search for a country with limited provider coverage | App shows honest empty/limited-results messaging | Not Run |
| QA-11 | Inspect remote, on-site, hybrid, internship and part-time results | Available types are not arbitrarily excluded; unspecified types are not guessed | Not Run |
| QA-12 | Open a job result | Original job link opens the corresponding listing | Not Run |
| QA-13 | Search when job providers return no listings | Useful empty state; no invented listings | Not Run |
| QA-14 | Simulate job-provider failure | User sees recoverable error; app remains responsive | Not Run |
| QA-15 | Simulate Groq timeout/rate limit | Clear failure message; no endless loading state | Not Run |
| QA-16 | Groq returns `gaps` as a string rather than an array | Backend normalizes or gracefully handles response | Not Run |
| QA-17 | Select a job and tailor the CV | Draft reflects job requirements without inventing credentials | Not Run |
| QA-18 | Edit the tailored CV | Edited fields remain visible in the review interface | Not Run |
| QA-19 | Download tailored CV as `.docx` | Valid Word document opens with reviewed content | Not Run |
| QA-20 | Download tailored CV as `.pdf` | Valid PDF opens with reviewed content | Not Run |
| QA-21 | Compare Word and PDF exports | Names, dates, employers, qualifications and content agree | Not Run |
| QA-22 | Refresh or navigate during a workflow | State behavior is understandable; no misleading claim of persistence | Not Run |
| QA-23 | Test small mobile viewport | Inputs, results, and buttons remain usable | Not Run |
| QA-24 | Navigate with keyboard | Inputs/buttons are reachable and focus is visible | Not Run |
| QA-25 | Open deployed `/api/health` | Returns `{"status":"ok"}` | Not Run |
| QA-26 | Run complete workflow on Netlify | Upload, search, tailor, Word/PDF export all succeed | Not Run |
| QA-27 | Inspect repository/build logs | No API keys or personal CV content exposed in logs | Not Run |

## Accuracy and responsible AI checks

Review at least three **fictional** CVs (junior, experienced, career changer) against several job descriptions. Check whether role suggestions are relevant to the user's search, the job's location is supported by provider data, and the stated fit reasons are traceable to the CV. Inspect every tailored CV for invented employers, dates, degrees, achievements, contact details, or skills. Treat match percentages as estimates, **not hiring probabilities**.

Job availability and country coverage depend on third-party providers; this application cannot guarantee all jobs in every country. A job's employment arrangement or eligibility should be labelled unknown if the provider does not specify it.

## Non-functional checks

- **Performance:** Record page-load, job-search, AI-tailoring and export durations; investigate slow requests and Netlify Function timeouts.
- **Security:** Keep Groq and Adzuna keys server-side; never use `VITE_` for secrets; verify file type and size validation; avoid logging CV text.
- **Privacy:** Use fictional test CVs. Confirm how CV content is processed and review third-party privacy policies before using real applicant data.
- **Reliability:** Test provider outages, malformed AI JSON, retries, duplicate clicks and network interruptions.
- **Usability:** Confirm labels, loading indicators, empty states and errors are clear.

## Defect report template

```text
Bug ID:
Title:
Environment / URL:
Severity: Critical | High | Medium | Low
Preconditions:
Steps to reproduce:
Expected result:
Actual result:
Screenshot / console / function logs:
Status: Open | In Progress | Fixed | Retest | Closed
Tester / date:
```

## Execution summary

| Metric | Value |
| --- | --- |
| Planned test cases | 27 |
| Passed | 0 (not yet tested) |
| Failed | 0 (not yet tested) |
| Blocked | 0 (not yet tested) |
| Not Run | 27 |
| Release decision | Pending testing |

## Release criteria

Release only after the critical workflows (upload, search, country filtering, job selection, CV tailoring, both exports, and Netlify API routing) pass; no critical or high-severity defects remain unresolved; API keys are protected; and CV accuracy has been manually reviewed. Keep screenshots and test logs as evidence in a `qa/evidence/` folder (without personal information).

## Known limitations

- Job provider coverage varies by country and job type; some listings may be incomplete or expired.
- AI output may be inaccurate and must be checked before job applications.
- Netlify Function timeouts and external API limits may affect longer searches.
- Text-based PDFs are supported; scanned PDFs may not extract correctly.
- This README is a QA plan, not evidence that tests have been run.
"# Ai-Career-finder" 
"# Ai-Career-finder" 
"# Ai-Career-finder" 
"# AI-Careers" 
"# AI-Careers" 
"# AI-Careers" 
"# AI-Careers" 
"# AI-CAreer-finder" 

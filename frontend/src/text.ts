export interface TextDictionary {
  // Upload screen
  greeting: string;
  appTitle: string;
  subtitle: string;
  description: string;
  dropHere: string;
  dropRelease: string;
  browseHint: string;
  waitingUpload: string;
  waitingUploadDrag: string;
  uploadBoxTitle: string;
  gbcaTag: string;

  // Identified screen
  foundIt: string;
  cantWait: string;
  runCheck: string;
  wrongReupload: string;

  // Results screen
  strengths: string;
  noFindings: string;
  advisoryNote: string;
  scoreLabelGood: string;
  scoreLabelMid: string;
  scoreLabelBad: string;

  // Badges
  badgeCritical: string;
  badgeMajor: string;
  badgeMinor: string;
  badgeGeneral: string;

  // Scanning / Analysing
  scanningTitle: string;
  analysisTitle: string;
  scanningQuips: string[];
  analysisQuips: string[];
  scanningPrefix: string;
  analysingPrefix: string;

  // Errors
  errorUploadPrefix: string;
  errorAnalysePrefix: string;

  // Ticker
  ticker: string;

  // Footer
  footerMadeBy: string;

  // Boot
  bootingText: string;
}

export const funText: TextDictionary = {
  greeting: "Hi! I'm",
  appTitle: "M.A.G.S.",
  subtitle: "ur friendly neighbourhood Machine-Assisted Green Star reviewer",
  description:
    "drop a Green Star submission document and i'll identify the credit, check it against GBCA reference guides, and flag any structural, content, or terminology issues before it goes to the assessors~",
  dropHere: "~ drop ur file here ~",
  dropRelease: "gimme! gimme!",
  browseHint: "or click to browse!! (pdf, docx, xlsx, txt)",
  waitingUpload: ">>> waiting 4 upload <<<",
  waitingUploadDrag: ">>> aaaaah <<<",
  uploadBoxTitle: "upload_zone.exe",
  gbcaTag: "a GBCA production",

  foundIt: "found it!!",
  cantWait: "i can't wait to review this credit",
  runCheck: "Run Compliance Check!!",
  wrongReupload: "wrong? re-upload",

  strengths: "things u did great!!",
  noFindings: "no findings here!",
  advisoryNote: "advisory only ~ not a formal assessment",
  scoreLabelGood: "lookin good!!",
  scoreLabelMid: "needs some work~",
  scoreLabelBad: "uh oh spaghetti-o",

  badgeCritical: "XX CRITICAL XX",
  badgeMajor: "!! MAJOR ISSUE !!",
  badgeMinor: "~ MINOR ISSUE ~",
  badgeGeneral: "i GENERAL i",

  scanningTitle: "scanning.exe",
  analysisTitle: "analysis.exe",
  scanningQuips: [
    "hmm, interesting...",
    "ooh i've seen one of these before",
    "reading every last pixel",
    "this is giving Green Star energy",
    "let me put my glasses on",
    "flipping through the pages",
    "ok ok i think i know what this is",
    "just a sec, nearly there",
    "doing my best speed-read",
    "i promise i'm not just looking at the pictures",
  ],
  analysisQuips: [
    "checking the fine print",
    "sharpening my red pen",
    "i live for a good submission form",
    "cross-referencing everything",
    "being thorough so you don't have to be",
    "this is the fun part (for me)",
    "no stone left unturned",
    "channelling my inner assessor",
    "triple-checking my findings",
    "almost done, hold tight",
  ],
  scanningPrefix: "reading",
  analysingPrefix: "checking",

  errorUploadPrefix: "ack!! ",
  errorAnalysePrefix: "boom: ",

  ticker:
    "\u2605 M.A.G.S. v1.0 \u2605 upload ur Green Star submission & let the machine do the checking \u2605 now with AI-powered credit identification \u2605 saving assessors one document at a time \u2605 built by GBCA \u2605",

  footerMadeBy: "~ made by GBCA ~",

  bootingText: "~ booting up ~",
};

export const boardText: TextDictionary = {
  greeting: "Welcome to",
  appTitle: "M.A.G.S.",
  subtitle: "Machine-Assisted Green Star Reviewer",
  description:
    "Upload a Green Star submission document to identify the credit, check it against GBCA reference guides, and flag any structural, content, or terminology issues before assessment.",
  dropHere: "Drop your file here",
  dropRelease: "Release to upload",
  browseHint: "or click to browse (PDF, DOCX, XLSX, TXT)",
  waitingUpload: "Awaiting upload",
  waitingUploadDrag: "Drop file to upload",
  uploadBoxTitle: "Upload Document",
  gbcaTag: "Green Building Council of Australia",

  foundIt: "Credit Identified",
  cantWait: "The following credit was identified",
  runCheck: "Run Compliance Check",
  wrongReupload: "Re-upload",

  strengths: "Strengths Identified",
  noFindings: "No findings in this category.",
  advisoryNote: "Advisory only \u2014 not a formal assessment",
  scoreLabelGood: "Strong submission",
  scoreLabelMid: "Needs improvement",
  scoreLabelBad: "Significant issues found",

  badgeCritical: "CRITICAL",
  badgeMajor: "MAJOR",
  badgeMinor: "MINOR",
  badgeGeneral: "GENERAL",

  scanningTitle: "Scanning Document",
  analysisTitle: "Analysing Submission",
  scanningQuips: [
    "Parsing document structure...",
    "Extracting content...",
    "Reading document pages...",
    "Processing file contents...",
    "Identifying document format...",
    "Scanning for credit references...",
    "Analysing document layout...",
    "Preparing for identification...",
    "Reviewing submission content...",
    "Processing uploaded file...",
  ],
  analysisQuips: [
    "Checking compliance requirements...",
    "Cross-referencing guidelines...",
    "Reviewing submission structure...",
    "Validating terminology usage...",
    "Assessing documentation completeness...",
    "Checking against reference materials...",
    "Evaluating evidence provided...",
    "Reviewing compliance criteria...",
    "Analysing submission quality...",
    "Finalising assessment...",
  ],
  scanningPrefix: "Reading",
  analysingPrefix: "Analysing",

  errorUploadPrefix: "Error: ",
  errorAnalysePrefix: "Analysis error: ",

  ticker:
    "M.A.G.S. \u2014 Machine-Assisted Green Star Reviewer \u2014 Upload your Green Star submission for automated compliance checking \u2014 Powered by GBCA",

  footerMadeBy: "Powered by GBCA",

  bootingText: "Loading...",
};

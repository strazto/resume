#!/usr/bin/env node

const resumeFile = require("./resume.json");
var themeOut = "jsonresume-theme-even"
if (resumeFile.meta && resumeFile.meta.theme) {
  themeOut = resumeFile.meta.theme; 
}

process.stdout.write(themeOut); 


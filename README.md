# -Payment-Fraud-Detection-Chrome-Extension-

## Overview
A Chrome extension that detects potential payment fraud by analyzing webpage security threats using Google Safe Browsing, VirusTotal, and AI-based risk assessment.

## Features
. Real-time Page Scan – Detects phishing and fraud attempts
. Risk Scoring System – Assigns risk levels based on threats
. Security API Integration – Uses Google Safe Browsing and VirusTotal
. Alerts for Unsafe Websites – Notifies users of risks before payments
. AI-Based Analysis – Gemini API for intelligent fraud detection

## Tech Stack
. Frontend: JavaScript, HTML, CSS
. Backend: Node.js, Express.js
. APIs Used: Google Safe Browsing, VirusTotal, Gemini API (for AI-based risk detection)
. Storage: Chrome local storage

## Load the extension into Chrome:
Open Chrome and go to chrome://extensions/
Enable Developer Mode (top-right corner)
Click Load Unpacked and select the extension folder

## Usage
. Click the extension icon to scan the current webpage
. The extension will analyze the page and provide a risk score
. If threats are detected, a list of alerts will be displayed
. Users can manually report fraudulent sites through the report feature

## Project Structure
project-folder/

│── server/              

│   ├── server.js        

│   ├── google.js        

│   ├── virustotal.js    

│── extension/           

│   ├── manifest.json    

│   ├── popup.html       

│   ├── popup.js         

│   ├── content.js       

│   ├── background.js    

│── README.md            

│── .env                 

│── package.json         

## License
This project is licensed under the MIT License.# Fraud-detection-chrome-extension

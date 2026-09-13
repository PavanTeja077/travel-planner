const pptxgen = require('pptxgenjs');

let pres = new pptxgen();
pres.author = "Mogili PavanTeja";
pres.company = "Anurag University";
pres.title = "Travel Planner MERN Project";
pres.layout = "LAYOUT_16x9";

// Define master slide with exact corner styling
pres.defineSlideMaster({
  title: "MASTER_SLIDE",
  background: { color: "F3F4F6" }, // light gray/white background resembling the image
  objects: [
    // Top Left Decorations
    // Large Red Triangle in corner
    { shape: { type: pres.ShapeType.rightTriangle, options: { x: 0, y: 0, w: 1.5, h: 1.5, fill: { color: "D32F2F" }, line: { type: "none" }, flipH: true, flipV: true, rotate: 180 } } },
    // Red diagonal strip
    { shape: { type: pres.ShapeType.parallelogram, options: { x: -0.2, y: 0.8, w: 2, h: 0.2, fill: { color: "D32F2F" }, line: { type: "none" }, rotate: -45 } } },
    // Blue diagonal strip
    { shape: { type: pres.ShapeType.parallelogram, options: { x: 0.3, y: 1.1, w: 1.5, h: 0.1, fill: { color: "1976D2" }, line: { type: "none" }, rotate: -45 } } },

    // Bottom Right Decorations
    // Large Blue Triangle in corner
    { shape: { type: pres.ShapeType.rightTriangle, options: { x: 8.5, y: 4.125, w: 1.5, h: 1.5, fill: { color: "1976D2" }, line: { type: "none" } } } },
    // Red diagonal strip
    { shape: { type: pres.ShapeType.parallelogram, options: { x: 8.2, y: 4.5, w: 2, h: 0.1, fill: { color: "D32F2F" }, line: { type: "none" }, rotate: -45 } } },

    // Top Right Logo - we'll just add text that looks like the logo for now, 
    // or try fetching from the URL if we can.
    { text: { text: "Z ANURAG", options: { x: 7, y: 0.2, w: 2.5, h: 0.5, fontSize: 24, color: "003366", bold: true, align: "right", fontFace: "Arial" } } },
    { text: { text: "UNIVERSITY", options: { x: 7, y: 0.6, w: 2.5, h: 0.3, fontSize: 12, color: "003366", align: "right", fontFace: "Arial", letterSpacing: 2 } } },

    // Footer Text
    { text: { text: "7/2/2026", options: { x: 0.5, y: "90%", w: 2, h: 0.5, fontSize: 10, color: "888888" } } },
    { text: { text: "Department of Information Technology", options: { x: "25%", y: "90%", w: "50%", h: 0.5, fontSize: 10, color: "888888", align: "center" } } }
  ]
});

// Slide 1: Title
let slide1 = pres.addSlide({ masterName: "MASTER_SLIDE" });
slide1.addText("Travel Planner MERN Full Stack Collaborative\nTravel Management Platform", {
  x: 1, y: 2, w: 8, h: 1.5,
  fontSize: 28, align: "center", bold: true, color: "000000"
});
slide1.addText("Mogili PavanTeja\n24eg112d27", {
  x: 1, y: 4, w: 4, h: 1,
  fontSize: 20, align: "left", color: "000000"
});
slide1.addText("Project Guide\nAssistant Professor, IT Dept", {
  x: 6, y: 4, w: 3.5, h: 1,
  fontSize: 16, align: "left", color: "000000"
});
slide1.addText("1", { x: 9.3, y: 5.1, w: 0.5, h: 0.5, color: "FFFFFF", fill: { color: "1976D2" }, align: "center", fontSize: 10 });

// Helper function for standard content slides
function addContentSlide(title, content, slideNum) {
  let slide = pres.addSlide({ masterName: "MASTER_SLIDE" });
  slide.addText(title, { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 24, bold: true, align: "center", color: "000000" });
  
  if (Array.isArray(content)) {
    slide.addText(content.map(text => ({ text: text, options: { bullet: true } })), {
      x: 1, y: 1.5, w: 8, h: 3.5, fontSize: 18, color: "000000", lineSpacing: 25
    });
  } else {
    slide.addText(content, {
      x: 1, y: 1.5, w: 8, h: 3.5, fontSize: 18, color: "000000", lineSpacing: 25
    });
  }
  slide.addText(slideNum.toString(), { x: 9.3, y: 5.1, w: 0.5, h: 0.5, color: "FFFFFF", fill: { color: "1976D2" }, align: "center", fontSize: 10 });
}

// Slide 2: Introduction
addContentSlide("Introduction", 
  "The Travel Planner is a comprehensive full-stack web application developed to simplify the process of organizing and managing group trips. The platform allows users to collaboratively build itineraries, track group expenses, and communicate in real-time through a secure and user-friendly interface.\n\nBuilt using the MERN stack with Socket.io, the system provides a scalable, responsive, and efficient solution for modern travel planning.", 
  2);

// Slide 3: Abstract
addContentSlide("Abstract", 
  "The Travel Planner project is a collaborative management platform that enables users to organize their trips digitally. The system eliminates scattered planning by providing an easy-to-use centralized online platform for travelers.\n\nDeveloped using React.js, Node.js, Express.js, MongoDB, and Socket.io, the application includes secure authentication, itinerary planning, expense tracking, real-time communication, and responsive user interfaces. The project demonstrates practical implementation of full-stack web development for improving travel organization and group coordination.", 
  3);

// Slide 4: Project Overview
addContentSlide("Project Overview", [
  "Full Stack Travel Management System",
  "Interactive Itinerary Planning",
  "Secure User Authentication",
  "Real-time Group Chat via Socket.io",
  "Expense Tracking and Management",
  "User Profile & Dashboard",
  "Responsive Web Application",
  "RESTful API Communication",
  "MongoDB Database Integration"
], 4);

// Slide 5: Problem Statement
addContentSlide("Problem Statement", 
  "Traditional group travel planning relies on scattered tools like spreadsheets, separate messaging apps, and manual expense calculations, resulting in confusion, miscommunication, and inefficient trip management. Users often struggle to access a unified view of their travel plans.\n\nThe proposed Travel Planner system addresses these challenges by providing a secure online platform where users can easily collaborate on itineraries, chat in real-time, manage expenses, and centralize all travel-related activities efficiently.", 
  5);

// Slide 6: Objectives
addContentSlide("Objectives", [
  "Develop a complete MERN stack travel management application.",
  "Simplify the group travel planning and coordination process.",
  "Reduce reliance on multiple scattered apps for trip organization.",
  "Implement secure JWT-based authentication.",
  "Manage itineraries, expenses, and user information efficiently.",
  "Provide a responsive and user-friendly interface.",
  "Facilitate real-time communication using Socket.io.",
  "Develop scalable RESTful APIs for backend communication."
], 6);

// Slide 7: Application Workflow
let wfSlide = pres.addSlide({ masterName: "MASTER_SLIDE" });
wfSlide.addText("Application Workflow", { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 24, bold: true, align: "center", color: "000000" });
wfSlide.addText("+----------------------+\n| User                 |\n+----------------------+\n          |\n          v\n+----------------------+\n| Register / Login     |\n+----------------------+\n          |\n          v\n+----------------------+\n| Dashboard & Profile  |\n+----------------------+", { x: 1, y: 1.5, w: 3, h: 3, fontSize: 12, fontFace: "Courier New" });
wfSlide.addText("+----------------------+\n| Create/Select Trip   |\n+----------------------+\n          |\n          v\n+----------------------+\n| Plan Itinerary       |\n+----------------------+\n          |\n          v\n+----------------------+\n| Manage Expenses      |\n+----------------------+\n          |\n          v\n+----------------------+\n| Real-time Chat       |\n+----------------------+", { x: 5, y: 1.5, w: 3, h: 3, fontSize: 12, fontFace: "Courier New" });
wfSlide.addText("7", { x: 9.3, y: 5.1, w: 0.5, h: 0.5, color: "FFFFFF", fill: { color: "1976D2" }, align: "center", fontSize: 10 });

// Slide 8: Key Features
addContentSlide("Key Features", [
  "User Registration & Login",
  "JWT Authentication",
  "Trip Dashboard",
  "Interactive Itinerary Builder",
  "Expense Tracker",
  "Real-time Group Chat",
  "Responsive Design",
  "RESTful API Integration",
  "MongoDB Database"
], 8);

// Slide 9: System Architecture
addContentSlide("System Architecture", [
  "Presentation Layer: React.js Frontend (Tailwind CSS, Zustand, Leaflet Maps)",
  "Business Logic Layer: Node.js + Express.js backend for REST API, Socket.io for WebSockets",
  "Database Layer: MongoDB Atlas (Mongoose for Object Modeling)",
  "Storage Layer: Cloudinary for image uploads",
  "Authentication Layer: JWT and bcryptjs"
], 9);

// Slide 10: User Interface (Screenshots)
let uiSlide = pres.addSlide({ masterName: "MASTER_SLIDE" });
uiSlide.addText("User Interface (Screenshots)", { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 24, bold: true, align: "center", color: "000000" });
uiSlide.addText("[ Please paste your application screenshots here ]", { x: 1, y: 2.5, w: 8, h: 1, fontSize: 20, align: "center", color: "888888", italic: true });
uiSlide.addText("10", { x: 9.3, y: 5.1, w: 0.5, h: 0.5, color: "FFFFFF", fill: { color: "1976D2" }, align: "center", fontSize: 10 });

// Slide 11: Technologies Used
addContentSlide("Technologies Used", [
  "Frontend: React.js, Tailwind CSS, Zustand, React Leaflet, JavaScript",
  "Backend: Node.js, Express.js, Socket.io, Node-Cron",
  "Database: MongoDB, Mongoose",
  "Authentication: JWT (JSON Web Token)",
  "Development Tools: Visual Studio Code, Git, GitHub, Postman"
], 11);

// Slide 12: Technical Learning Outcomes
addContentSlide("Technical Learning Outcomes", [
  "Developed a Full Stack MERN Application with Real-time features.",
  "Designed Responsive User Interfaces using React.js and Tailwind.",
  "Built RESTful APIs using Express.js.",
  "Implemented WebSockets for real-time chat with Socket.io.",
  "Integrated MongoDB Database using Mongoose.",
  "Applied JWT Authentication for Secure Access.",
  "Performed CRUD Operations Efficiently.",
  "Used Git & GitHub for Version Control."
], 12);

// Slide 13: Conclusion
addContentSlide("Conclusion", 
  "The Travel Planner project successfully demonstrates the development of a secure and efficient collaborative travel management platform using MERN stack technologies and WebSockets. The application simplifies trip planning, enhances user coordination, and improves expense tracking through a responsive and user-friendly interface.\n\nThis project strengthened practical knowledge in full-stack web development, real-time communication, RESTful API design, database management, authentication, and responsive application development.", 
  13);

// Slide 14: THANK YOU!
let thankYouSlide = pres.addSlide({ masterName: "MASTER_SLIDE" });
thankYouSlide.addText("THANK YOU!", { x: 1, y: 2.5, w: 8, h: 1, fontSize: 40, bold: true, align: "center", color: "000000" });
thankYouSlide.addText("14", { x: 9.3, y: 5.1, w: 0.5, h: 0.5, color: "FFFFFF", fill: { color: "1976D2" }, align: "center", fontSize: 10 });

pres.writeFile({ fileName: 'Travel_Planner_Project_Presentation_V2.pptx' }).then(fileName => {
  console.log('created file: ' + fileName);
});

const fs = require('fs');
const buf = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==", "base64");
fs.writeFileSync('C:\\Users\\ashha\\OneDrive\\Desktop\\SIH\\Drishti-AI\\test_image.png', buf);

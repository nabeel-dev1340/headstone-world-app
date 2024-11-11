const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const { config } = require("dotenv");
const path = require("path");
const { PASSWORDS } = require("./data/users");
const { RECIPIENTS } = require("./data/recipients");
const fs = require("fs");
const XLSX = require("xlsx");
const Mailjet = require("node-mailjet");
const { match } = require("assert");
const csv = require("csv-parser");

const app = express();
const port = 3001;

const UPLOADS_DIR = "../../jobs/2024";

// Load environment variables from .env file
config();

// Buffer to store data from different API calls//
let globalUser;
let bufferedData = [];

function prepareRowData(data) {
  const [date, time, user, headstone, invoice, deposit] = data;
  return [
    date,
    time,
    user,
    headstone,
    invoice === "invoice" ? "X" : "", // Assuming 'invoice' should be replaced with 'X'
    "", // Assuming 'WO' should be left empty
    deposit, // Including 'deposit' value
  ];
}
function writeToExcelInvoice() {
  try {
    // const filePath = "dailyreport.xlsx";
    const filePath = path.join(__dirname, "..", "dailyreport.xlsx");
    const headerRow = [
      "Date",
      "Time",
      "User",
      "Headstone",
      "Invoice",
      "WO",
      "Deposite",
    ];
    let workbook;
    if (fs.existsSync(filePath)) {
      // Load existing workbook
      workbook = XLSX.readFile(filePath);
    } else {
      // Create new workbook if file doesn't exist
      workbook = XLSX.utils.book_new();
      // Add header row to new worksheet
      const worksheet = XLSX.utils.aoa_to_sheet([headerRow]);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    }
    // Get the first worksheet
    const sheetName = workbook.SheetNames[0] || "Data";
    const worksheet = workbook.Sheets[sheetName];
    // Add data row to worksheet
    const rowData = prepareRowData(bufferedData);
    XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: -1 });
    // Write workbook to file
    XLSX.writeFile(workbook, filePath);
    console.log(
      fs.existsSync(filePath)
        ? "Data appended to dailyreport.xlsx"
        : "New file dailyreport.xlsx created"
    );
    // Clear buffered data
    bufferedData = [];
  } catch (error) {
    console.error("Error writing data to Excel:", error);
    // Clear buffered data only in case of errors
    bufferedData = [];
  }
}

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE,
  {
    config: {},
    options: {},
  }
);

// Function to process deposits and update the file
// async function processDeposits(filePath, depositColumnIndex = 6) {
//   try {
//     const workbook = XLSX.readFile(filePath);
//     const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//     if (!worksheet) {
//       throw new Error("Worksheet not found in the file.");
//     }
//     const lastRow = XLSX.utils.decode_range(worksheet["!ref"]).e.r;
//     for (let row = 1; row <= lastRow; row++) {
//       const depositCellAddress = XLSX.utils.encode_cell({
//         c: depositColumnIndex,
//         r: row,
//       });
//       const timestampCellAddress = getTimestampCellAddress(depositCellAddress);
//       if (!worksheet[depositCellAddress] || !worksheet[timestampCellAddress]) {
//         console.warn(`Skipping row ${row}: Missing deposit or timestamp cell.`);
//         continue;
//       }
//       const depositValue = worksheet[depositCellAddress]?.v || 0;
//       const totalDepositCellAddress = getDepositTotalCellAddress(
//         row,
//         depositColumnIndex
//       );
//       let totalDeposit = worksheet[totalDepositCellAddress]?.v || 0;
//       totalDeposit += depositValue;
//       worksheet[totalDepositCellAddress] = { v: totalDeposit };
//     }
//     const outputFile = `deposits_with_totals_${new Date().toISOString()}.xlsx`;
//     XLSX.writeFile(workbook, outputFile);
//     console.log(
//       `Total deposits calculated and saved successfully to ${outputFile}`
//     );
//   } catch (error) {
//     console.error("Error processing deposits:", error.message);
//   }
// }
// function getTimestampCellAddress(depositCellAddress) {
//   const colIndex = XLSX.utils.decode_cell(depositCellAddress).c;
//   return XLSX.utils.encode_cell({
//     c: colIndex + 1,
//     r: XLSX.utils.decode_cell(depositCellAddress).r,
//   });
// }
// function getDepositTotalCellAddress(row, depositColumnIndex) {
//   const totalColumnIndex = depositColumnIndex + 1;
//   return XLSX.utils.encode_cell({ c: totalColumnIndex, r: row });
// }
// // Schedule the deposit calculation to run every minute
// const filefordeposite = path.join(__dirname, "..", "dailyreport.xlsx");
// cron.schedule("* * * * *", () => {
//   processDeposits(filefordeposite)
//     .then(() => console.log("Deposit calculation completed."))
//     .catch((error) => console.error("Error calculating deposits:", error));
// });
// // Example usage:
// processDeposits(filefordeposite); // Optional initial calculation (without scheduling)
//---------------------------------------------------------------------------------------------

// Function to send an email using Mailjet
async function sendMailjetEmail(toEmail, subject, text) {
  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: RECIPIENTS["from"],
          Name: "Headstone World",
        },
        To: [
          {
            Email: toEmail,
            Name: "Headstone World",
          },
        ],
        Subject: subject,
        TextPart: "From Headstone World",
      },
    ],
  });

  request
    .then((result) => {
      console.log("Email sent:", result.body);
    })
    .catch((err) => {
      console.log(err.statusCode);
    });
}

// Sanitize a string to remove characters not allowed in FTP names
function sanitizeForFTP(name) {
  return name.replace(/[^a-zA-Z0-9_]/g, "_");
}

// Define the storage for uploaded PDFs
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.json());

// Enable CORS for all routes
// Define your CORS options
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Use this after the variable declaration
// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Login endpoint
app.post("/login", async (req, res) => {
  console.log("Hello");
  try {
    const { password } = req.body;
    console.log(password);

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (PASSWORDS.includes(password)) {
      // Authentication successful
      res.status(200).json({ message: "Authentication successful" });
    } else {
      return res.status(401).json({ message: "Incorrect Password" });
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
});

app.post("/log", async (req, res) => {
  try {
    let { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }
    const filePath = path.join(__dirname, "..", "userData.xlsx");
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Convert Excel data to JSON
    const excelData = XLSX.utils.sheet_to_json(sheet);
    // [ { user: 'abdullah habib', password: 101395, role: 'admin\t' } ]
    const userMatch = excelData.find(
      (entry) => entry.user === username && entry.password === Number(password)
    );
    if (userMatch) {
      // Authentication successful
      const role = userMatch.role;
      const user = userMatch.user;
      res
        .status(200)
        .json({ message: "Authentication successful", role, user });
      if (role == "admin") {
        globalUser = username;
      }
    } else {
      return res.status(401).json({ message: "Incorrect Password" });
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
});

const convertDateToDDMMYYYY = (dateString) => {
  const [year, month, day] = dateString.split("-");
  const formattedDay = day.padStart(2, "0");
  const formattedMonth = month.padStart(2, "0");
  return `${formattedDay}/${formattedMonth}/${year}`;
};
app.get("/reports", (req, res) => {
  const { startDate, endDate } = req.query; // Dates are expected in YYYY-MM-DD format
  if (!startDate || !endDate) {
    return res.status(400).send({
      error: "Please provide both startDate and endDate query parameters",
    });
  }
  // Convert startDate and endDate to DD/MM/YYYY format for comparison
  const startDateDDMMYYYY = convertDateToDDMMYYYY(startDate);
  const endDateDDMMYYYY = convertDateToDDMMYYYY(endDate);
  fs.readFile("report.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).send({ error: "Error reading from file" });
    }
    try {
      const reports = JSON.parse(data);
      const filteredReports = reports.filter((report) => {
        // Now we can directly compare the strings since they are in the same format
        return (
          report.date >= startDateDDMMYYYY && report.date <= endDateDDMMYYYY
        );
      });
      // Calculate the sum of deposits
      const sumOfDeposits = filteredReports.reduce((total, report) => {
        return total + (parseInt(report.deposit) || 0);
      }, 0);
      res.json({ reports: filteredReports, sumOfDeposits });
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      res.status(500).send({ error: "Error parsing data" });
    }
  });
});

app.get("/hello", (req, res) => {
  res.json({ message: "Hello" });
});

app.get("/workorderpdf", (req, res) => {
  const csvFilePath = "./data/model-details.csv";
  const jsonFilePath = "./data/model_details.json";

  // Check if the CSV file exists and is accessible
  fs.access(csvFilePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("Error: CSV file does not exist or cannot be accessed.");
      res
        .status(500)
        .json({ error: "CSV file does not exist or cannot be accessed." });
      return;
    }

    // If the file exists, proceed to read it
    const data = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row) => {
        data.push(row);
      })
      .on("end", () => {
        // Convert the data to JSON and write it to the JSON file
        fs.writeFile(jsonFilePath, JSON.stringify(data, null, 2), (err) => {
          if (err) {
            console.error("Error writing to JSON file:", err);
            res.status(500).json({ error: "Error writing to JSON file." });
            return;
          }

          console.log("CSV data successfully written to JSON file.");
          res.json(data);
        });
      });
  });
});

app.post(
  "/save-invoice",
  upload.fields([{ name: "pdf" }, { name: "jpg" }]),
  async (req, res) => {
    try {
      const pdfBuffer = req.files["pdf"][0].buffer; // Extract invoice PDF buffer
      const jpgBuffer = req.files["jpg"][0].buffer; // Extract work-order JPG buffer
      const { headstoneName, invoiceNo, deposit, username, paymentMethod } =
        req.body;

      const sanitizedHeadstoneName = sanitizeForFTP(headstoneName);

      const directoryName = `${sanitizedHeadstoneName.replace(
        / /g,
        "_"
      )}_${invoiceNo}`;
      const directoryPath = path.join(__dirname, UPLOADS_DIR, directoryName);
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
      }

      let invoiceFileName = "invoice_v1.pdf";
      let fileIndex = 1;
      while (fs.existsSync(path.join(directoryPath, invoiceFileName))) {
        fileIndex++;
        invoiceFileName = `invoice_v${fileIndex}.pdf`;
      }

      const pdfFilePath = path.join(directoryPath, invoiceFileName);
      const jpgFilePath = path.join(directoryPath, "work-order.jpg");
      const jsonFilePath = path.join(directoryPath, "data.json");

      fs.writeFileSync(pdfFilePath, pdfBuffer);
      fs.writeFileSync(jpgFilePath, jpgBuffer);

      let dataToSave = {};

      if (fs.existsSync(jsonFilePath)) {
        const existingData = fs.readFileSync(jsonFilePath, "utf8");
        dataToSave = JSON.parse(existingData);
      }

      if (deposit && deposit !== "") {
        const today = new Date().toISOString().split("T")[0];
        const newDeposit = {
          depositAmount: deposit,
          date: today,
          paymentMethod: paymentMethod,
        };

        if (dataToSave.hasOwnProperty("deposits")) {
          dataToSave.deposits.push(newDeposit);
        } else {
          dataToSave.deposits = [newDeposit];
        }
      }

      dataToSave.data = req.body;
      dataToSave.data.deposit = "";

      fs.writeFileSync(jsonFilePath, JSON.stringify(dataToSave, null, 2));

      const baseDirectory = path.join(__dirname, UPLOADS_DIR);
      const workOrderDirectory = path.join(
        baseDirectory,
        directoryName,
        "Work Order"
      );

      if (!fs.existsSync(workOrderDirectory)) {
        fs.mkdirSync(workOrderDirectory, { recursive: true });
      }

      const foundationInstallDirectory = path.join(
        workOrderDirectory,
        "Foundation"
      );
      const monumentSettingDirectory = path.join(
        workOrderDirectory,
        "Monument Setting"
      );
      const engravingSubmissionDirectory = path.join(
        workOrderDirectory,
        "Engraved"
      );
      const cemeterySubmissionDirectory = path.join(
        workOrderDirectory,
        "Design Approved"
      );
      const finalArtDirectory = path.join(directoryPath, "Artwork");
      const cemeteryApprovalDirectory = path.join(
        directoryPath,
        "Cemetery Approval"
      );

      if (!fs.existsSync(cemeterySubmissionDirectory)) {
        fs.mkdirSync(cemeterySubmissionDirectory, { recursive: true });
      }
      if (!fs.existsSync(foundationInstallDirectory)) {
        fs.mkdirSync(foundationInstallDirectory, { recursive: true });
      }
      if (!fs.existsSync(monumentSettingDirectory)) {
        fs.mkdirSync(monumentSettingDirectory, { recursive: true });
      }
      if (!fs.existsSync(engravingSubmissionDirectory)) {
        fs.mkdirSync(engravingSubmissionDirectory, { recursive: true });
      }
      if (!fs.existsSync(finalArtDirectory)) {
        fs.mkdirSync(finalArtDirectory, { recursive: true });
      }
      if (!fs.existsSync(cemeteryApprovalDirectory)) {
        fs.mkdirSync(cemeteryApprovalDirectory, { recursive: true });
      }

      res
        .status(200)
        .json({ message: "PDF file and data saved successfully." });

      const date = new Date();
      const formattedDate = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      bufferedData.push(formattedDate);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const time = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
      bufferedData.push(time);
      bufferedData.push(username);
      bufferedData.push(headstoneName);
      bufferedData.push("invoice");
      bufferedData.push(deposit);
      console.log(bufferedData);

      const newData = {
        date: formattedDate,
        time: time,
        user: username,
        headstoneName: headstoneName,
        type: "invoice",
        deposit: deposit,
      };

      fs.readFile("report.json", "utf8", (err, data) => {
        let reportData = [];
        if (err) {
          console.error("Error reading file:", err);
        } else {
          try {
            reportData = data ? JSON.parse(data) : [];
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            return;
          }
        }

        reportData.push(newData);

        fs.writeFile(
          "report.json",
          JSON.stringify(reportData, null, 2),
          "utf8",
          (writeErr) => {
            if (writeErr) {
              console.error("Error writing file:", writeErr);
            } else {
              console.log("Data appended to file successfully!");
            }
          }
        );
      });

      writeToExcelInvoice();
    } catch (error) {
      console.error("Error while saving and uploading PDF:", error);
      res.status(500).json({ error: "Internal Server Error." });
    }
  }
);

// Handle the /submit-to-cemetery endpoint
app.post("/submit-to-cemetery", upload.array("images"), async (req, res) => {
  try {
    const { headStoneName, invoiceNo } = req.body;
    const imageFiles = req.files; // Get an array of uploaded image files as Buffers

    // Create a unique directory name for Cemetery Submission
    const directoryName = `${headStoneName.replace(/ /g, "_")}_${invoiceNo}`;

    // Define the local directory paths
    const baseDirectory = path.join(__dirname, UPLOADS_DIR);
    const workOrderDirectory = path.join(
      baseDirectory,
      directoryName,
      "Work Order"
    );
    const cemeterySubmissionDirectory = path.join(
      workOrderDirectory,
      "Cemetery_Submission"
    );

    // Create Work Order and Cemetery_Submission directories
    if (!fs.existsSync(workOrderDirectory)) {
      fs.mkdirSync(workOrderDirectory, { recursive: true });
    }
    if (!fs.existsSync(cemeterySubmissionDirectory)) {
      fs.mkdirSync(cemeterySubmissionDirectory, { recursive: true });
    } else {
      // Delete old images in the Cemetery_Submission directory
      const filesInCemeterySubmission = fs.readdirSync(
        cemeterySubmissionDirectory
      );
      filesInCemeterySubmission.forEach((file) => {
        const filePath = path.join(cemeterySubmissionDirectory, file);
        fs.unlinkSync(filePath);
      });
      console.log("Deleted old images in Cemetery_Submission directory.");
    }

    // Save uploaded images as files in the Cemetery Submission directory
    imageFiles.forEach((imageFile, index) => {
      // Determine the file extension based on the MIME type
      const extension = getFileExtension(imageFile.mimetype);

      // Generate a unique filename for each image (e.g., using a timestamp)
      const uniqueFileName = `${Date.now()}_${index}.${extension}`;
      const localImageFilePath = path.join(
        cemeterySubmissionDirectory,
        uniqueFileName
      );
      fs.writeFileSync(localImageFilePath, imageFile.buffer);
    });

    console.log("Images Saved.");

    // Add your email sending logic here if needed
    // RECIPIENTS["cemeteryApprovalGranite"].forEach(async function (email) {
    //   await sendMailjetEmail(
    //     email,
    //     `${headStoneName}: Prepare Cemetery Application`,
    //     ""
    //   );
    // });

    res.status(200).json({
      message: "Images saved and submitted to the cemetery successfully.",
    });
  } catch (error) {
    console.error("Error while submitting to the cemetery:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

function getFileExtension(mimeType) {
  console.log(mimeType);
  switch (mimeType) {
    // Image file types
    case "image/jpeg":
    case "image/pjpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    case "image/webp":
      return "webp";
    case "image/bmp":
      return "bmp";
    case "image/tiff":
      return "tiff";

    // Document file types
    case "application/pdf":
      return "pdf";
    case "application/msword":
      return "doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    case "application/vnd.ms-excel":
      return "xls";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "xlsx";
    case "application/vnd.ms-powerpoint":
      return "ppt";
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return "pptx";
    case "application/rtf":
      return "rtf";
    case "application/vnd.oasis.opendocument.text":
      return "odt";

    // Text file type
    case "text/plain":
      return "txt";

    // Other file types
    case "application/octet-stream": // For .plt and other unknown types
      return "plt";

    default:
      return "unknown";
  }
}

// Define the /art-submission endpoint
app.post(
  "/art-submission",
  upload.array("finalArtImages"),
  async (req, res) => {
    try {
      const { headstoneName, invoiceNo, finalArtLength, cemeteryArtLength } =
        req.body;
      const finalArtImages = req.files;

      // Create a unique directory name for Art Submission
      const directoryName = `${headstoneName.replace(/ /g, "_")}_${invoiceNo}`;

      // Define the local directory paths
      const baseDirectory = path.join(__dirname, UPLOADS_DIR);
      const artSubmissionDirectory = path.join(
        baseDirectory,
        directoryName,
        "Work Order",
        "Art_Submission"
      );
      const finalArtDirectory = path.join(artSubmissionDirectory, "Final_Art");
      const cemeteryApprovalDirectory = path.join(
        artSubmissionDirectory,
        "Cemetery_Approval"
      );

      // Create directories
      if (!fs.existsSync(artSubmissionDirectory)) {
        fs.mkdirSync(artSubmissionDirectory, { recursive: true });
      }
      if (!fs.existsSync(finalArtDirectory)) {
        fs.mkdirSync(finalArtDirectory, { recursive: true });
      }
      if (!fs.existsSync(cemeteryApprovalDirectory)) {
        fs.mkdirSync(cemeteryApprovalDirectory, { recursive: true });
      } else {
        // Delete existing files in Final_Art directory
        const filesInFinalArt = fs.readdirSync(finalArtDirectory);
        filesInFinalArt.forEach((file) => {
          const filePath = path.join(finalArtDirectory, file);
          fs.unlinkSync(filePath);
        });

        // Delete existing files in Cemetery_Approval directory
        const filesInCemeteryApproval = fs.readdirSync(
          cemeteryApprovalDirectory
        );
        filesInCemeteryApproval.forEach((file) => {
          const filePath = path.join(cemeteryApprovalDirectory, file);
          fs.unlinkSync(filePath);
        });

        console.log(
          "Deleted old images in Final_Art and Cemetery_Approval directories."
        );
      }

      // Move uploaded images to the Final_Art directory
      for (let i = 0; i < finalArtLength; i++) {
        const image = finalArtImages[i];
        // Determine the file extension based on the MIME type
        const extension = getFileExtension(image.mimetype);
        // Generate a unique filename for each image (e.g., using a timestamp)
        const uniqueFileName = `${Date.now()}_${i}.${extension}`;
        const localImageFilePath = path.join(finalArtDirectory, uniqueFileName);
        fs.writeFileSync(localImageFilePath, image.buffer);
      }

      // Move uploaded images to the cemeter approval directory
      for (let i = finalArtLength; i < finalArtImages.length; i++) {
        const image = finalArtImages[i];
        // Determine the file extension based on the MIME type
        const extension = getFileExtension(image.mimetype);
        // Generate a unique filename for each image (e.g., using a timestamp)
        const uniqueFileName = `${Date.now()}_${i}.${extension}`;
        const localImageFilePath = path.join(
          cemeteryApprovalDirectory,
          uniqueFileName
        );
        fs.writeFileSync(localImageFilePath, image.buffer);
      }

      console.log("Images Saved.");
      // Add your email sending logic here if needed
      // RECIPIENTS["cemeteryApprovalEngraving"].forEach(async function (email) {
      //   await sendMailjetEmail(
      //     email,
      //     `${headstoneName}: Ready for engraving`,
      //     ""
      //   );
      // });

      // Respond with a success message and a 200 status code
      res.status(200).json({ message: "Art submission successful!" });
    } catch (error) {
      console.error("Error processing art submission:", error);

      // If there's an error, respond with a 500 status code
      res.status(500).json({ error: "Internal Server Error." });
    }
  }
);

// endpoint for engraving
app.post(
  "/engraving-submission",
  upload.array("engravingImages"),
  async (req, res) => {
    try {
      const { headstoneName, invoiceNo } = req.body;
      const engravingImages = req.files;

      // Create a unique directory name for Engraving Submission
      const directoryName = `${headstoneName.replace(/ /g, "_")}_${invoiceNo}`;

      // Define the local directory paths
      const baseDirectory = path.join(__dirname, UPLOADS_DIR);
      const engravingSubmissionDirectory = path.join(
        baseDirectory,
        directoryName,
        "Work Order",
        "Engraved"
      );

      // Create the Engraving_Submission directory
      if (!fs.existsSync(engravingSubmissionDirectory)) {
        fs.mkdirSync(engravingSubmissionDirectory, { recursive: true });
      } else {
        // Delete existing files in the Engraving_Submission directory
        const filesInEngravingSubmission = fs.readdirSync(
          engravingSubmissionDirectory
        );
        filesInEngravingSubmission.forEach((file) => {
          const filePath = path.join(engravingSubmissionDirectory, file);
          fs.unlinkSync(filePath);
        });

        console.log("Deleted old images in Engraving_Submission directory.");
      }

      // Save multiple engraving images
      engravingImages.forEach((engravingImage, index) => {
        const extension = getFileExtension(engravingImage.mimetype);
        const uniqueFileName = `${Date.now()}_${index}.${extension}`;
        const localImageFilePath = path.join(
          engravingSubmissionDirectory,
          uniqueFileName
        );
        fs.writeFileSync(localImageFilePath, engravingImage.buffer);
      });

      console.log("Images Saved.");
      // RECIPIENTS["engravingPhoto"].forEach(async function (email) {
      //   await sendMailjetEmail(email, `${headStoneName}: Monument Install`, "");
      // });
      // Respond with a success message and a 200 status code
      res.status(200).json({ message: "Engraving submission successful!" });
    } catch (error) {
      console.error("Error processing engraving submission:", error);

      // If there's an error, respond with a 500 status code
      res.status(500).json({ error: "Internal Server Error." });
    }
  }
);

// Define the /foundation-submission endpoint
app.post(
  "/foundation-submission",
  upload.array("foundationInstallImages"),
  async (req, res) => {
    try {
      const {
        headstoneName,
        invoiceNo,
        foundationImagesLength,
        monumentImagesLength,
      } = req.body;
      const foundationInstallImages = req.files;

      // Create a unique directory name for Foundation Submission
      const directoryName = `${headstoneName.replace(/ /g, "_")}_${invoiceNo}`;

      // Define the local directory paths
      const baseDirectory = path.join(__dirname, UPLOADS_DIR);
      const foundationInstallDirectory = path.join(
        baseDirectory,
        directoryName,
        "Work Order",
        "Foundation"
      );
      const monumentSettingDirectory = path.join(
        baseDirectory,
        directoryName,
        "Work Order",
        "Monument Setting"
      );

      // Create directories
      if (!fs.existsSync(foundationInstallDirectory)) {
        fs.mkdirSync(foundationInstallDirectory, { recursive: true });
      }
      if (!fs.existsSync(monumentSettingDirectory)) {
        fs.mkdirSync(monumentSettingDirectory, { recursive: true });
      } else {
        // Delete existing files in Foundation_Install directory
        const filesInFoundationInstall = fs.readdirSync(
          foundationInstallDirectory
        );
        filesInFoundationInstall.forEach((file) => {
          const filePath = path.join(foundationInstallDirectory, file);
          fs.unlinkSync(filePath);
        });

        // Delete existing files in Monument_Setting directory
        const filesInMonumentSetting = fs.readdirSync(monumentSettingDirectory);
        filesInMonumentSetting.forEach((file) => {
          const filePath = path.join(monumentSettingDirectory, file);
          fs.unlinkSync(filePath);
        });

        console.log(
          "Deleted old images in Foundation_Install and Monument_Setting directories."
        );
      }

      // Move uploaded images to the Foundation_Install directory
      for (let i = 0; i < foundationImagesLength; i++) {
        const image = foundationInstallImages[i];
        // Determine the file extension based on the MIME type
        const extension = getFileExtension(image.mimetype);
        // Generate a unique filename for each image (e.g., using a timestamp)
        const uniqueFileName = `${Date.now()}_${i}.${extension}`;
        const localImageFilePath = path.join(
          foundationInstallDirectory,
          uniqueFileName
        );
        fs.writeFileSync(localImageFilePath, image.buffer);
      }

      // Move uploaded images to the Monument Setting directory
      for (
        let i = foundationImagesLength;
        i < foundationInstallImages.length;
        i++
      ) {
        const image = foundationInstallImages[i];
        // Determine the file extension based on the MIME type
        const extension = getFileExtension(image.mimetype);
        // Generate a unique filename for each image (e.g., using a timestamp)
        const uniqueFileName = `${Date.now()}_${i}.${extension}`;
        const localImageFilePath = path.join(
          monumentSettingDirectory,
          uniqueFileName
        );
        fs.writeFileSync(localImageFilePath, image.buffer);
      }
      // RECIPIENTS["monumentSetting"].forEach(async function (email) {
      //   await sendMailjetEmail(email, `${headstoneName}: Monument Install`, "");
      // });
      // Respond with a success message and a 200 status code
      res
        .status(200)
        .json({ message: "Foundation/Setting submission successful!" });
    } catch (error) {
      console.error("Error processing Foundation/Setting submission:", error);

      // If there's an error, respond with a 500 status code
      res.status(500).json({ error: "Internal Server Error." });
    }
  }
);

function prepareRowDataWO(data) {
  const [date, time, user, headstone, invoice, workOrder, deposit] = data;
  return [
    date,
    time,
    user,
    headstone,
    "",
    "X", // Include 'X' if work order is present
    deposit,
  ];
}
function writeToExcelInvoiceWO() {
  try {
    // const filePath = "dailyreport.xlsx";
    const filePath = path.join(__dirname, "..", "dailyreport.xlsx");
    const headerRow = [
      "Date",
      "Time",
      "User",
      "Headstone",
      "Invoice",
      "WO",
      "Deposite",
    ];
    let workbook;
    if (fs.existsSync(filePath)) {
      // Load existing workbook
      workbook = XLSX.readFile(filePath);
    } else {
      // Create new workbook if file doesn't exist
      workbook = XLSX.utils.book_new();
      // Add header row to new worksheet
      const worksheet = XLSX.utils.aoa_to_sheet([headerRow]);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    }
    // Get the first worksheet
    const sheetName = workbook.SheetNames[0] || "Data";
    const worksheet = workbook.Sheets[sheetName];
    // Add data row to worksheet
    const rowData = prepareRowDataWO(bufferedData);
    XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: -1 });
    // Write workbook to file
    XLSX.writeFile(workbook, filePath);
    console.log(
      fs.existsSync(filePath)
        ? "Data appended to dailyreport.xlsx"
        : "New file dailyreport.xlsx created"
    );
    // Clear buffered data
    bufferedData = [];
  } catch (error) {
    console.error("Error writing data to Excel:", error);
    // Clear buffered data only in case of errors
    bufferedData = [];
  }
}

// endpoint to save work order and req.body as data.json
app.post("/work-order", upload.single("workOrder"), async (req, res) => {
  try {
    const workOrder = req.file;
    const data = req.body;
    const {
      headStoneName,
      invoiceNo,
      username,
      cemeteryDate,
      cemeteryFollowUp1,
      cemeteryFollowUp2,
      cemeteryApprovedDate,
      cemeteryNotes,
      photoDate,
      photoFollowUp1,
      photoFollowUp2,
      photoApprovedDate,
      photoNotes,
      bronzeDate,
      bronzeFollowUp1,
      bronzeFollowUp2,
      bronzeApprovedDate,
      bronzeNotes,
    } = req.body;

    // Create a unique directory name for Cemetery Submission
    const directoryName = `${headStoneName.replace(/ /g, "_")}_${invoiceNo}`;
    const baseDirectory = path.join(__dirname, UPLOADS_DIR);
    const workOrderDirectory = path.join(
      baseDirectory,
      directoryName,
      "Work Order"
    );

    // Create Work Order directory if it doesn't exist
    if (!fs.existsSync(workOrderDirectory)) {
      fs.mkdirSync(workOrderDirectory, { recursive: true });
    }

    // Determine the next available work order file name
    let workOrderFileName = "work order_v1.png";
    let fileIndex = 1;
    while (fs.existsSync(path.join(workOrderDirectory, workOrderFileName))) {
      fileIndex++;
      workOrderFileName = `work order_v${fileIndex}.png`;
    }

    // Save the work order file with the determined file name
    const localFilePath = path.join(workOrderDirectory, workOrderFileName);
    fs.writeFileSync(localFilePath, workOrder.buffer);

    // Save req.body as data.json
    // const dataFilePath = path.join(workOrderDirectory, "data.json");
    // fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

    // Respond with a success message and a 200 status code
    res
      .status(200)
      .json({ message: "Work Order and data saved successfully!" });
    const date = new Date();
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }); // Format the date
    bufferedData.push(formattedDate);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const time = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
    bufferedData.push(time);
    bufferedData.push(username);
    bufferedData.push(headStoneName);
    bufferedData.push("WorkOrder");
    console.log(bufferedData);
    const newData = {
      date: formattedDate,
      time: time,
      user: username,
      headstoneName: headStoneName,
      type: "Work Order",
    };
    fs.readFile("report.json", "utf8", (err, data) => {
      let reportData = [];
      if (err) {
        console.error("Error reading file:", err);
      } else {
        try {
          reportData = data ? JSON.parse(data) : []; // Initialize with an empty array if file is empty
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
          return;
        }
      }
      // Push new data to the array
      reportData.push(newData);
      // Write the updated array back to the JSON file
      fs.writeFile(
        "report.json",
        JSON.stringify(reportData, null, 2),
        "utf8",
        (writeErr) => {
          if (writeErr) {
            console.error("Error writing file:", writeErr);
          } else {
            console.log("Data appended to file successfully!");
          }
        }
      );
    });
    writeToExcelInvoiceWO();
    const dataPath = path.join(baseDirectory, directoryName, "data.json");
    fs.readFile(dataPath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      try {
        // Parse JSON data
        let jsonData = JSON.parse(data);

        // Update values for keys for each object
        jsonData.data.cemeteryDate = cemeteryDate[0];
        jsonData.data.cemeteryFollowUp1 = cemeteryFollowUp1[0];
        jsonData.data.cemeteryFollowUp2 = cemeteryFollowUp2[0];
        jsonData.data.cemeteryApprovedDate = cemeteryApprovedDate[0];
        jsonData.data.cemeteryNotes = cemeteryNotes;

        jsonData.data.photoDate = photoDate[0];
        jsonData.data.photoFollowUp1 = photoFollowUp1[0];
        jsonData.data.photoFollowUp2 = photoFollowUp2[0];
        jsonData.data.photoApprovedDate = photoApprovedDate[0];
        jsonData.data.photoNotes = photoNotes;

        jsonData.data.bronzeDate = bronzeDate[0];
        jsonData.data.bronzeFollowUp1 = bronzeFollowUp1[0];
        jsonData.data.bronzeFollowUp2 = bronzeFollowUp2[0];
        jsonData.data.bronzeApprovedDate = bronzeApprovedDate[0];
        jsonData.data.bronzeNotes = bronzeNotes;

        // Write the updated array back to the JSON file
        fs.writeFile(
          dataPath,
          JSON.stringify(jsonData, null, 2),
          "utf8",
          (writeErr) => {
            if (writeErr) {
              console.error("Error writing file:", writeErr);
            } else {
              console.log("Data updated and saved to file successfully!");
            }
          }
        );
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
      }
    });
  } catch (error) {
    console.error("Error processing Work Order:", error);

    // If there's an error, respond with a 500 status code
    res.status(500).json({ error: "Internal Server Error." });
  }
});

//get work orders
app.get("/work-orders", async (req, res) => {
  try {
    const headstoneName = req.query.headstoneName;

    if (!headstoneName) {
      return res
        .status(400)
        .json({ error: "Headstone name is required as a query parameter." });
    }

    // Define the uploads directory path
    const uploadsDirectory = path.join(__dirname, UPLOADS_DIR);

    // List all directory names inside the uploads directory
    const directoryNames = fs.readdirSync(uploadsDirectory);

    // Filter directories that match the headstoneName wildcard and contain "INV"
    const matchingDirectories = directoryNames.filter((directory) => {
      directory = directory.toLowerCase();
      directory = directory.replace(/_/g, " ");
      return (
        directory.includes("inv") &&
        directory.includes(headstoneName.toLowerCase())
      );
    });

    if (matchingDirectories.length > 0) {
      const matchingRecords = matchingDirectories.map((matchingDirectory) => {
        const splitName = matchingDirectory.split("INV");
        const nameOnHeadstone = splitName[0].replace(/_/g, " ");
        const invoiceNum = splitName[1].split("-")[1];

        if (match) {
          const extractedHeadstoneName = nameOnHeadstone;
          const extractedInvoiceNo = invoiceNum;

          return {
            headstoneName: extractedHeadstoneName,
            invoiceNo: extractedInvoiceNo,
          };
        } else {
          return {
            error: "Invalid directory name format",
          };
        }
      });

      res.status(200).json(matchingRecords);
    } else {
      res.status(404).json({ error: "No matching directories found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/invoice", async (req, res) => {
  try {
    // Extract the invoiceNo from query parameters
    const { invoiceNo } = req.query;
    console.log(invoiceNo);

    // Define the uploads directory path
    const uploadsDirectory = path.join(__dirname, UPLOADS_DIR);

    // List all directory names inside the uploads directory
    const directoryNames = fs.readdirSync(uploadsDirectory);

    // Find a directory whose name matches the invoiceNo
    const matchingDirectory = directoryNames.find((directoryName) =>
      directoryName.includes(invoiceNo)
    );
    console.log(matchingDirectory);

    if (!matchingDirectory) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Get the data from the data.json file in the matching directory
    const dataFilePath = path.join(
      uploadsDirectory,
      matchingDirectory,
      "data.json"
    );
    const data = fs.readFileSync(dataFilePath, "utf8");
    console.log(data);

    // Parse the JSON data
    const invoiceData = JSON.parse(data);

    // Send the invoice data as the response
    res.status(200).json(invoiceData);
  } catch (error) {
    console.error("Error fetching invoice data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/work-order", async (req, res) => {
  try {
    const invoiceNo = req.query.invoiceNo;
    if (!invoiceNo) {
      return res
        .status(400)
        .json({ error: "Invoice number is required as a query parameter." });
    }
    const baseDirectory = path.join(__dirname, UPLOADS_DIR);
    const directoryNames = await fs.promises.readdir(baseDirectory);
    const matchingDirectory = directoryNames.find((directoryName) =>
      directoryName.includes(invoiceNo)
    );
    if (!matchingDirectory) {
      return res.status(404).json({ error: "Matching directory not found." });
    }
    const matchingDirectoryPath = path.join(baseDirectory, matchingDirectory);
    const dataJsonFilePath = path.join(
      matchingDirectoryPath,
      "Work Order",
      "data.json"
    );
    // Work order is not created
    if (!fs.existsSync(dataJsonFilePath)) {
      const invoiceDataFilePath = path.join(matchingDirectoryPath, "data.json");
      const jsonContent = await fs.promises.readFile(
        invoiceDataFilePath,
        "utf-8"
      );
      const jsonData = JSON.parse(jsonContent);
      const dataToUse = jsonData.data;
      const imageTypes = {
        jpg: "jpeg",
        jpeg: "jpeg",
        png: "png",
        gif: "gif",
      };
      const convertImageToBase64 = async (imagePath) => {
        const imageData = await fs.promises.readFile(imagePath);
        const imageType = path.extname(imagePath).slice(1);
        const dataUriPrefix = `data:image/${
          imageTypes[imageType] || "jpeg"
        };base64,`;
        return dataUriPrefix + imageData.toString("base64");
      };
      const getImageArray = async (imagePath) => {
        const stats = await fs.promises.stat(imagePath);
        if (stats.isDirectory()) {
          const imageFileNames = await fs.promises.readdir(imagePath);
          const promises = imageFileNames.map(async (imageName) => {
            const imageFilePath = path.join(imagePath, imageName);
            if (fs.existsSync(imageFilePath)) {
              // Check if the image file still exists
              const imageStats = await fs.promises.stat(imageFilePath);
              const imageType = path
                .extname(imageFilePath)
                .slice(1)
                .toLowerCase();
              if (["jpg", "jpeg", "png", "gif"].includes(imageType)) {
                // Ensure the file is an image
                const imageMetadata = {
                  fileName: imageName,
                  base64Data: await convertImageToBase64(imageFilePath),
                  createdAt: imageStats.birthtime, // Creation date
                  modifiedAt: imageStats.mtime, // Last modified date
                };
                return imageMetadata;
              }
            }
            return null;
          });
          const results = await Promise.all(promises);
          return results.filter((image) => image !== null); // Filter out null values
        }
        return [];
      };
      const tasks = [
        getImageArray(
          path.join(matchingDirectoryPath, "Work Order", "Design Approved")
        ),
        getImageArray(
          path.join(matchingDirectoryPath, "Work Order", "Engraved")
        ),
        getImageArray(
          path.join(matchingDirectoryPath, "Work Order", "Foundation")
        ),
        getImageArray(
          path.join(matchingDirectoryPath, "Work Order", "Monument Setting")
        ),
        getImageArray(path.join(matchingDirectoryPath, "Cemetery Approval")),
        getImageArray(path.join(matchingDirectoryPath, "Artwork")),
      ];
      const [
        cemeterySubmission,
        engravingSubmission,
        foundationInstall,
        monumentSetting,
        cemeteryApproval,
        finalArt,
      ] = await Promise.all(tasks);
      return res.status(200).json({
        headStoneName: dataToUse.headstoneName,
        invoiceNo: dataToUse.invoiceNo,
        date: dataToUse.date,
        customerEmail: dataToUse.customerEmail,
        customerName: dataToUse.customerName,
        customerPhone: dataToUse.customerPhone,
        cemeteryDate: dataToUse.cemeteryDate,
        cemeteryFollowUp1: dataToUse.cemeteryFollowUp1,
        cemeteryFollowUp2: dataToUse.cemeteryFollowUp2,
        cemeteryApprovedDate: dataToUse.cemeteryApprovedDate,
        cemeteryNotes: dataToUse.cemeteryNotes,
        photoDate: dataToUse.photoDate,
        photoFollowUp1: dataToUse.photoFollowUp1,
        photoFollowUp2: dataToUse.photoFollowUp2,
        photoApprovedDate: dataToUse.photoApprovedDate,
        photoNotes: dataToUse.photoNotes,
        bronzeDate: dataToUse.bronzeDate,
        bronzeFollowUp1: dataToUse.bronzeFollowUp1,
        bronzeFollowUp2: dataToUse.bronzeFollowUp2,
        bronzeApprovedDate: dataToUse.bronzeApprovedDate,
        bronzeNotes: dataToUse.bronzeNotes,
        cemeteryName: dataToUse.cemetery,
        customCemetery: dataToUse.customCemetery,
        cemeteryAddress: dataToUse.cemeteryAddress,
        cemeteryContact: dataToUse.cemeteryContact,
        lotNumber: dataToUse.lotNumber,
        details: dataToUse.details,
        model1: dataToUse.model1,
        selectModelImage1: dataToUse.selectModelImage1,
        modelColor1: dataToUse.modelColor1,
        customColor1: dataToUse.customColor1,
        model2: dataToUse.model2,
        selectModelImage2: dataToUse.selectModelImage2,
        modelColor2: dataToUse.modelColor2,
        customColor2: dataToUse.customColor2,
        model3: dataToUse.model3,
        selectModelImage3: dataToUse.selectModelImage3,
        modelColor3: dataToUse.modelColor3,
        customColor3: dataToUse.customColor3,
        model4: dataToUse.model4,
        modelColor4: dataToUse.modelColor4,
        customColor4: dataToUse.customColor4,
        model5: dataToUse.model5,
        modelColor5: dataToUse.modelColor5,
        customColor5: dataToUse.customColor5,
        cemeterySubmission: cemeterySubmission,
        engravingSubmission: engravingSubmission,
        foundationInstall: foundationInstall,
        monumentSetting: monumentSetting,
        cemeteryApproval: cemeteryApproval,
        finalArt: finalArt,
      });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal server error.", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

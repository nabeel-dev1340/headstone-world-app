import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import IconWithText from "../components/IconWithTExt";
import IconHome from "../assets/icons/home.png";
import IconSave from "../assets/icons/diskette.png";
import BrandingSection from "../components/BrandingSection";
import HorizontalRule from "../components/HorizontalRule";
import {
  cemeteryNames,
  getCemeteryDataByName,
} from "../utils/cemeteryFunctions";
import ImageModal from "../components/ImageModal";
import colorOptions from "../utils/colorOptions";
import SuccessModal from "../components/SuccessModal";
import axios from "axios";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import WorkOrderPDF from "./WorkOrderPDF";

const InvoicehtmlForm = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [successModalIsOpen, setSuccessModalIsOpen] = useState(false);
  const [saveButtonText, setSaveButtonText] = useState("Save");
  const [modalIndex, setModalIndex] = useState(0);
  const [deposits, setDeposits] = useState([]);
  const [selectedCemetery, setSelectedCemetery] = useState("");
  const [customCemetery, setCustomCemetery] = useState("");
  const [showPDF, setShowPDF] = useState(false);

  const location = useLocation();

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleOpenModal = (index) => {
    setModalIsOpen(true);
    setModalIndex(index);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
  };

  const handleSuccessModalOpen = () => {
    setSuccessModalIsOpen(true);
  };

  const handleSuccessModalClose = () => {
    setSuccessModalIsOpen(false);
  };

  const handleImageSelect = (imageSrc, imageTitle, modelIndex) => {
    // Update the selected model image in your form data
    if (modelIndex === 1) {
      setFormData((prevData) => ({
        ...prevData,
        model1: imageSrc,
        selectModelImage1: imageTitle,
      }));
    } else if (modelIndex === 2) {
      setFormData((prevData) => ({
        ...prevData,
        model2: imageSrc,
        selectModelImage2: imageTitle,
      }));
    } else if (modelIndex === 3) {
      setFormData((prevData) => ({
        ...prevData,
        model3: imageSrc,
        selectModelImage3: imageTitle,
      }));
    } else if (modelIndex === 4) {
      setFormData((prevData) => ({
        ...prevData,
        model4: imageSrc,
        selectModelImage4: imageTitle,
      }));
    }
    handleCloseModal();
  };

  const generateInvoiceNumber = () => {
    const timestamp = new Date().getTime().toString();
    let randomDigits = "";

    // Generate 5 random indices within the timestamp length
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * timestamp.length);
      randomDigits += timestamp.charAt(randomIndex);
    }

    return `INV-${randomDigits}`;
  };

  useEffect(() => {
    const uniqueInvoiceNumber = generateInvoiceNumber();
    setFormData((prevData) => ({
      ...prevData,
      invoiceNo: uniqueInvoiceNumber,
      username: localStorage.getItem("username"),
    }));
    // Make the "invoiceNo" field read-only
    document.getElementById("invoice").readOnly = true;
  }, []);

  // Update the form data to include the initial today's date
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().substr(0, 10);

    setFormData((prevData) => ({
      ...prevData,
      date: formattedDate, // Pre-set the date field to today's date
    }));
  }, []);


  // get old data
  useEffect(() => {
    if (location.state) {
      console.log(location.state);
      setFormData(location.state?.data);
      if (location.state?.deposits) {
        setDeposits(location.state?.deposits);
      }
      if (location.state?.data?.customCemetery) {
        setSelectedCemetery("Other");
        setCustomCemetery(location.state.data.customCemetery);
        setFormData((prevData) => ({
          ...prevData,
          cemetery: "Other", // Set formData.cemetery to "Other"
        }));
      }
    }
  }, [location.state]);

  // Initialize state to store form data
  const [formData, setFormData] = useState({
    headstoneName: "",
    invoiceNo: "",
    date: "",
    username: "",
    cemeteryDate: "",
    cemeteryFollowUp1: "",
    cemeteryFollowUp2: "",
    cemeteryApprovedDate: "",
    cemeteryNotes: "",
    photoDate: "",
    photoFollowUp1: "",
    photoFollowUp2: "",
    photoApprovedDate: "",
    photoNotes: "",
    bronzeDate: "",
    bronzeFollowUp1: "",
    bronzeFollowUp2: "",
    bronzeApprovedDate: "",
    bronzeNotes: "",
    cemetery: "",
    cemeteryAddress: "",
    cemeteryContact: "",
    cemeteryPhone: "",
    zone: "",
    lotOwner: "",
    lotNumber: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    model1: "",
    selectModelImage1: "",
    modelColor1: "",
    customColor1: "",
    modelQty1: "",
    modelPrice1: "",
    subTotal: 0,
    tax: "",
    delivery: "",
    foundation: "",
    discount: 0,
    total: "",
    deposit: "",
    paymentMethod: "",
    balance: "",
    details: "",
    notes: "",
    model2: "",
    selectModelImage2: "",
    modelColor2: "",
    customColor2: "",
    modelQty2: "",
    modelPrice2: "",
    model3: "",
    selectModelImage3: "",
    modelColor3: "",
    customColor3: "",
    modelQty3: "",
    modelPrice3: "",
    model4: "",
    selectModelImage4: "",
    modelColor4: "",
    customColor4: "",
    modelQty4: "",
    modelPrice4: "",
    model5: "",
    modelColor5: "",
    customColor5: "",
    modelQty5: "",
    modelPrice5: "",
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    // Fetch and update cemetery data if cemetery is selected
    if (name === "cemetery") {
      if (value !== "Other") {
        const selectedCemeteryData = getCemeteryDataByName(value);
        setSelectedCemetery(value);
        if (selectedCemeteryData) {
          updatedFormData = {
            ...updatedFormData,
            cemeteryAddress: selectedCemeteryData.ADDRESS,
            cemeteryContact: selectedCemeteryData.CONTACT_NAME,
            cemeteryPhone: selectedCemeteryData.PHONE,
            zone: selectedCemeteryData.Zone,
          };
        }
      } else {
        setSelectedCemetery(value);
      }
    }

    if (name === "customCemetery") {
      setCustomCemetery(value);
      // Update formData.cemetery when "Other" is selected
      updatedFormData = {
        ...updatedFormData,
        customCemetery: value, // Update formData.cemetery here
      };
    }

    if (name === "deposit") {
      const total = parseFloat(formData.total) || 0;
      // Calculate sum of deposit amounts
      const depositSum = deposits.reduce(
        (accumulator, currentDeposit) =>
          accumulator + parseFloat(currentDeposit.depositAmount || 0),
        0
      );

      // Compute the balance
      const balance = total - depositSum - updatedFormData.deposit;

      updatedFormData.balance = balance.toFixed(2);
    }

    // Calculate subtotal when modelQty or modelPrice changes for all 4 models
    for (let i = 1; i <= 5; i++) {
      const qtyName = `modelQty${i}`;
      const priceName = `modelPrice${i}`;

      if (name === qtyName || name === priceName) {
        const quantity = parseFloat(updatedFormData[qtyName]);
        const price = parseFloat(updatedFormData[priceName]);

        if (!isNaN(quantity) && !isNaN(price)) {
          updatedFormData.subTotal = 0; // Reset subtotal
          for (let j = 1; j <= 5; j++) {
            const subQty = parseFloat(updatedFormData[`modelQty${j}`]);
            const subPrice = parseFloat(updatedFormData[`modelPrice${j}`]);
            if (!isNaN(subQty) && !isNaN(subPrice)) {
              updatedFormData.subTotal += subQty * subPrice;
            }
          }
          updatedFormData.subTotal = updatedFormData.subTotal.toFixed(2);
        }
      }
    }

    // Calculate total based on subtotal, tax, stake/delivery, and foundation
    const subTotal = parseFloat(updatedFormData.subTotal);
    const delivery = parseFloat(updatedFormData.delivery);
    const foundation = parseFloat(updatedFormData.foundation);
    const discountAmount = parseFloat(updatedFormData.discount); // Retrieve the discount amount

    // Calculate the total without discount
    let totalBeforeTax = subTotal;

    if (!isNaN(delivery)) {
      totalBeforeTax += delivery;
    }

    if (!isNaN(foundation)) {
      totalBeforeTax += foundation;
    }

    const taxPercentage = 8.25; // Fixed tax percentage
    const tax = (subTotal * (taxPercentage / 100)).toFixed(2);
    updatedFormData.tax = tax;

    // Apply the discount amount
    if (!isNaN(discountAmount) && discountAmount > 0) {
      updatedFormData.total = (
        totalBeforeTax -
        discountAmount +
        parseFloat(tax)
      ).toFixed(2);
    } else {
      updatedFormData.total = (totalBeforeTax + parseFloat(tax)).toFixed(2);
    }

    setFormData(updatedFormData);
  };

  useEffect(() => {
    const total = parseFloat(formData.total) || 0;

    // Calculate sum of deposit amounts
    const depositSum = deposits.reduce(
      (accumulator, currentDeposit) =>
        accumulator + parseFloat(currentDeposit.depositAmount || 0),
      0
    );

    // Compute the balance
    const balance = total - depositSum;

    // Update the 'balance' field in the form data
    setFormData((prevFormData) => ({
      ...prevFormData,
      balance: balance.toFixed(2),
    }));
  }, [deposits, formData.total]);

  const captureFormSnapshot = async () => {
    const pdf = new jsPDF({
      unit: "mm",
      format: "letter",
    });

    // Capture the form as an image using html-to-image
    const element = document.getElementById("invoice-form");
    const element2 = document.getElementById("work-order-pdf");

    if (!element) {
      console.error("Element with ID 'invoice-form' does not exist.");
      return;
    }

    if (!element2) {
      console.error("Element with ID 'work-order-pdf' does not exist.");
      return;
    }

    const imageDataUrl = await htmlToImage.toPng(element);
    const imageDataUrl2 = await htmlToImage.toJpeg(element2, { quality: 0.95 });

    // Create an Image object for the captured images
    const img = new Image();
    const img2 = new Image();
    img.src = imageDataUrl;
    img2.src = imageDataUrl2;

    // Wait for both images to load
    await Promise.all([
      new Promise((resolve) => {
        img.onload = resolve;
      }),
      new Promise((resolve) => {
        img2.onload = resolve;
      }),
    ]);

    const resizedImageDataUrl2 = await resizeImageToLetterSize(img2);

    // Add the captured images to the PDF
    pdf.addImage(img, "PNG", 0, 0, 215.9, 279.4); // Letter size: 215.9 x 279.4 mm

    // Save the PDFs as blobs
    const pdfBlob = pdf.output("blob");

    // Convert img2 (work order) to blob
    const response = await fetch(resizedImageDataUrl2);
    const jpgBlob = await response.blob();

    // Create a FormData object to send the blobs to the backend
    const finalFormData = new FormData();
    finalFormData.append("pdf", pdfBlob, "invoice.pdf");
    finalFormData.append("jpg", jpgBlob, "work-order.jpg");

    // Round specified values to two decimal places
    for (const key in formData) {
      if (
        key === "delivery" ||
        key === "discount" ||
        key === "foundation" ||
        key === "modelPrice1" ||
        key === "modelPrice2" ||
        key === "modelPrice3" ||
        key === "modelPrice4" ||
        key === "modelPrice5"
      ) {
        if (formData[key] !== "") {
          formData[key] = parseFloat(formData[key]).toFixed(2);
        }
      }
    }

    // Append each field of formData to finalFormData
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        finalFormData.append(key, formData[key]);
      }
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/save-invoice`,
        finalFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

      if (response.status === 200) {
        console.log("PDFs and data saved successfully");
        console.log(formData);
        setShowPDF(false);
        localStorage.removeItem("invoiceData");
        const updatedFormData = { ...formData, deposit: "" };
        setFormData(updatedFormData);
        handleSuccessModalOpen();
        setSaveButtonText("Saved");
      } else {
        console.error("Failed to save PDFs and data");
        setSaveButtonText("Save");
      }
    } catch (error) {
      console.error("Error while saving PDFs and data:", error);
      setSaveButtonText("Save");
    }
  };

  const resizeImageToLetterSize = async (img) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 2100;
    canvas.height = 2650;
    ctx.drawImage(img, 0, 0, 2100, 2650);
    return canvas.toDataURL("image/jpeg", 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveButtonText("Saving..");
    localStorage.setItem("invoiceData", JSON.stringify(formData));
    setShowPDF(true);
    try {
      // Update deposit
      if (!isNaN(parseFloat(formData.deposit))) {
        const depositAmount = parseFloat(formData.deposit);
        const newDeposit = {
          depositAmount: depositAmount.toFixed(2),
          date: new Date().toISOString().split("T")[0],
          paymentMethod: formData.paymentMethod,
        };

        // Perform actions like updating state with the deposit
        setDeposits((prevDeposits) => [...prevDeposits, newDeposit]);
      }
      // Capture the form snapshot as a PDF
      setTimeout(async () => {
        await captureFormSnapshot();
      }, 1000);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <NavBar className="nav-bar">
          <StyledLink to="/landing-page">
            <IconWithText iconSrc={IconHome} text="Home" />
          </StyledLink>
          <UtilityContainer>
            {localStorage.getItem("role") !== "viewer" ? (
              <IconWithText
                iconSrc={IconSave}
                type="submit"
                text={saveButtonText}
              />
            ) : null}
            {/* <IconWithText
              iconSrc={IconPrint}
              onClick={handlePrint}
              text="Print"
            /> */}
          </UtilityContainer>
        </NavBar>
        <div id="invoice-form">
          <BrandingSection />
          <HeadstoneInfoSection>
            <div
              className="input-row"
              style={{ width: "80%", margin: "0 auto" }}
            >
              <label
                htmlFor="name"
                style={{ marginRight: "10px", fontWeight: "bold" }}
              >
                Name on Headstone:
              </label>
              <input
                style={{ fontWeight: "bold" }}
                type="text"
                id="name"
                name="headstoneName"
                value={formData.headstoneName}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter name to be written on Headstone"
                readOnly={localStorage.getItem("role") === "viewer"}
                required
              />
            </div>
            <div className="input-row">
              <label
                style={{ fontWeight: "bold" }}
                htmlFor="invoice"
                className="flexy"
              >
                Invoice Number:
              </label>
              <input
                type="text"
                id="invoice"
                name="invoiceNo"
                value={formData.invoiceNo}
                readOnly
                style={{ fontWeight: "bold" }}
              />
              <label
                style={{ fontWeight: "bold" }}
                htmlFor="date"
                className="flexy"
              >
                Date:
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                readOnly={localStorage.getItem("role") === "viewer"}
                style={{ fontWeight: "bold" }}
              />
            </div>
          </HeadstoneInfoSection>
          <HorizontalRule />
          <CemetrySection>
            <table>
              <tbody>
                <tr className="input-row">
                  <th>
                    <label style={{ fontWeight: "bold" }} htmlFor="cemetery">
                      Cemetery:
                    </label>
                  </th>
                  <td colSpan="3">
                    <select
                      id="cemetery"
                      name="cemetery"
                      value={formData.cemetery}
                      onChange={handleInputChange}
                      disabled={localStorage.getItem("role") === "viewer"}
                      style={{ fontWeight: "bold" }}
                    >
                      <option value="">Select Cemetery</option>
                      {cemeteryNames.map((cemeteryName) => (
                        <option key={cemeteryName} value={cemeteryName}>
                          {cemeteryName}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                    {selectedCemetery === "Other" && (
                      <input
                        type="text"
                        name="customCemetery"
                        value={customCemetery}
                        onChange={handleInputChange}
                        placeholder="Enter Cemetery Name"
                        onKeyPress={handleKeyPress}
                      />
                    )}
                  </td>
                </tr>
                <tr className="input-row">
                  <th>
                    <label htmlFor="address" style={{ fontWeight: "bold" }}>
                      Address:
                    </label>
                  </th>
                  <td>
                    <input
                      type="text"
                      id="address"
                      readOnly={localStorage.getItem("role") === "viewer"}
                      name="cemeteryAddress"
                      value={formData.cemeteryAddress}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      style={{ fontWeight: "bold" }}
                    />
                  </td>
                  <th>
                    <label
                      htmlFor="cemeteryContact"
                      style={{ fontWeight: "bold" }}
                    >
                      Cemetery Contact:
                    </label>
                  </th>
                  <td>
                    <input
                      type="text"
                      id="cemeteryContact"
                      name="cemeteryContact"
                      readOnly={localStorage.getItem("role") === "viewer"}
                      value={formData.cemeteryContact}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      style={{ fontWeight: "bold" }}
                    />
                  </td>
                  <th>
                    <label htmlFor="phone" style={{ fontWeight: "bold" }}>
                      Phone:
                    </label>
                  </th>
                  <td>
                    <input
                      type="text"
                      id="phone"
                      name="Cemeteryphone"
                      onChange={handleInputChange}
                      value={formData.cemeteryPhone}
                      readOnly={localStorage.getItem("role") === "viewer"}
                      onKeyPress={handleKeyPress}
                      style={{ fontWeight: "bold" }}
                    />
                  </td>
                </tr>
                <tr className="input-row">
                  <th>
                    <label htmlFor="zone" style={{ fontWeight: "bold" }}>
                      Zone:
                    </label>
                  </th>
                  <td>
                    <input
                      type="text"
                      id="zone"
                      name="zone"
                      value={formData.zone}
                      readOnly={localStorage.getItem("role") === "viewer"}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      style={{ fontWeight: "bold" }}
                    />
                  </td>
                  <th>
                    <label htmlFor="lotOwner" style={{ fontWeight: "bold" }}>
                      Lot Owner:
                    </label>
                  </th>
                  <td>
                    <input
                      type="text"
                      id="lotOwner"
                      name="lotOwner"
                      value={formData.lotOwner}
                      onChange={handleInputChange}
                      readOnly={localStorage.getItem("role") === "viewer"}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter Lot"
                      style={{ fontWeight: "bold" }}
                    />
                  </td>
                  <th>
                    <label htmlFor="lotNumber" style={{ fontWeight: "bold" }}>
                      Lot Number:
                    </label>
                  </th>
                  <td>
                    <input
                      type="text"
                      id="lotNumber"
                      name="lotNumber"
                      value={formData.lotNumber}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      readOnly={localStorage.getItem("role") === "viewer"}
                      placeholder="Enter lot number"
                      style={{ fontWeight: "bold" }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </CemetrySection>
          <HorizontalRule />
          <CustomerDetailsSection>
            <div className="row">
              <label htmlFor="customerName" style={{ fontWeight: "bold" }}>
                Customer Name:
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                readOnly={localStorage.getItem("role") === "viewer"}
                onKeyPress={handleKeyPress}
                placeholder="Enter customer name"
                style={{ fontWeight: "bold" }}
              />
              <label htmlFor="phone" style={{ fontWeight: "bold" }}>
                Phone:
              </label>
              <input
                type="text"
                id="phone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                readOnly={localStorage.getItem("role") === "viewer"}
                onKeyPress={handleKeyPress}
                placeholder="Enter customer phone"
                style={{ fontWeight: "bold" }}
              />
            </div>
            <div className="row">
              <label htmlFor="email" style={{ fontWeight: "bold" }}>
                Email:
              </label>
              <input
                type="email"
                id="email"
                name="customerEmail"
                value={formData.customerEmail}
                readOnly={localStorage.getItem("role") === "viewer"}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter customer email"
                style={{ fontWeight: "bold" }}
              />
            </div>
          </CustomerDetailsSection>
          <HorizontalRule />
          <AccountsSection>
            <div className="model-row">
              <div className="model-input model-flex">
                {/* <label htmlFor="model">Model:</label> */}
                <SelectModelButton
                  type="button"
                  onClick={() => handleOpenModal(1)}
                  disabled={localStorage.getItem("role") === "viewer"}
                  style={{ width: "9.5rem", fontWeight: "bold" }}
                >
                  Select Model
                </SelectModelButton>
              </div>
              {formData.model1 !== "" && (
                <div className="selected-image">
                  <img
                    src={formData.model1}
                    style={{ width: "100px", height: "70px" }}
                    alt="Selected Model"
                  />
                  <p style={{ textAlign: "center", fontWeight: "bold" }}>
                    {formData.selectModelImage1}
                  </p>
                </div>
              )}
              <div className="model-color model-flex">
                <label htmlFor="model-color" style={{ fontWeight: "bold" }}>
                  Color:
                </label>
                <select
                  id="model-color"
                  name="modelColor1"
                  value={formData.modelColor1}
                  onChange={handleInputChange}
                  disabled={localStorage.getItem("role") === "viewer"}
                  style={{ fontWeight: "bold" }}
                >
                  <option value="">Select Color</option>
                  {Object.keys(colorOptions).map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                  <option value={"Custom Color"}>{"Custom Color"}</option>
                </select>
                {formData.modelColor1 === "Custom Color" && (
                  <input
                    type="text"
                    placeholder="Enter Color"
                    id="customColor1"
                    readOnly={localStorage.getItem("role") === "viewer"}
                    name="customColor1"
                    value={formData.customColor1}
                    onChange={(e) => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        customColor1: e.target.value,
                      }));
                    }}
                    style={{
                      maxWidth: "100%",
                      width: "6rem",
                      fontWeight: "bold",
                    }}
                  />
                )}
              </div>

              <div className="model-qty model-flex">
                <label htmlFor="model-qty" style={{ fontWeight: "bold" }}>
                  Qty:
                </label>
                <input
                  type="number"
                  name="modelQty1"
                  min={1}
                  readOnly={localStorage.getItem("role") === "viewer"}
                  value={formData.modelQty1}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Quantity"
                  style={{
                    width: "100%",
                    maxWidth: "3.8em",
                    fontWeight: "bold",
                  }}
                />
              </div>
              <div className="model-price model-flex">
                <label htmlFor="model-price" style={{ fontWeight: "bold" }}>
                  Price:
                </label>
                <input
                  type="text"
                  name="modelPrice1"
                  value={formData.modelPrice1}
                  onChange={handleInputChange}
                  readOnly={localStorage.getItem("role") === "viewer"}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Price"
                  style={{ fontWeight: "bold" }}
                />
              </div>
            </div>
            <div className="model-row">
              <div className="model-input model-flex">
                {/* <label htmlFor="model">Model:</label> */}
                <SelectModelButton
                  type="button"
                  onClick={() => handleOpenModal(2)}
                  disabled={localStorage.getItem("role") === "viewer"}
                  style={{ width: "9.5rem", fontWeight: "bold" }}
                >
                  Select Model
                </SelectModelButton>
              </div>
              {formData.model2 !== "" && (
                <div className="selected-image">
                  <img
                    src={formData.model2}
                    style={{ width: "100px", height: "70px" }}
                    alt="Selected Model"
                  />
                  <p style={{ textAlign: "center", fontWeight: "bold" }}>
                    {formData.selectModelImage2}
                  </p>
                </div>
              )}
              <div className="model-color model-flex">
                <label htmlFor="model-color" style={{ fontWeight: "bold" }}>
                  Color:
                </label>
                <select
                  id="model-color"
                  name="modelColor2"
                  disabled={localStorage.getItem("role") === "viewer"}
                  value={formData.modelColor2}
                  onChange={handleInputChange}
                  style={{ fontWeight: "bold" }}
                >
                  <option value="">Select Color</option>
                  {Object.keys(colorOptions).map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                  <option value={"Custom Color"}>{"Custom Color"}</option>
                </select>
                {formData.modelColor2 === "Custom Color" && (
                  <input
                    type="text"
                    placeholder="Enter Color"
                    id="customColor2"
                    name="customColor2"
                    readOnly={localStorage.getItem("role") === "viewer"}
                    value={formData.customColor2}
                    onChange={(e) => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        customColor2: e.target.value,
                      }));
                    }}
                    style={{
                      maxWidth: "100%",
                      width: "6rem",
                      fontWeight: "bold",
                    }}
                  />
                )}
              </div>
              <div className="model-qty model-flex">
                <label htmlFor="model-qty" style={{ fontWeight: "bold" }}>
                  Qty:
                </label>
                <input
                  type="number"
                  readOnly={localStorage.getItem("role") === "viewer"}
                  name="modelQty2"
                  min={1}
                  value={formData.modelQty2}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Quantity"
                  style={{
                    width: "100%",
                    maxWidth: "3.8em",
                    fontWeight: "bold",
                  }}
                />
              </div>
              <div className="model-price model-flex">
                <label htmlFor="model-price" style={{ fontWeight: "bold" }}>
                  Price:
                </label>
                <input
                  type="text"
                  name="modelPrice2"
                  value={formData.modelPrice2}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  readOnly={localStorage.getItem("role") === "viewer"}
                  placeholder="Enter Price"
                  style={{ fontWeight: "bold" }}
                />
              </div>
            </div>
            <div className="model-row">
              <div className="model-input model-flex">
                {/* <label htmlFor="model">Model:</label> */}
                <input
                  type="text"
                  name="model3"
                  readOnly={localStorage.getItem("role") === "viewer"}
                  value={formData.model3}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter model"
                  style={{ width: "10rem", fontWeight: "bold" }}
                />
              </div>

              <div className="model-color model-flex">
                <label htmlFor="model-color" style={{ fontWeight: "bold" }}>
                  Color:
                </label>
                <select
                  id="model-color"
                  name="modelColor3"
                  disabled={localStorage.getItem("role") === "viewer"}
                  value={formData.modelColor3}
                  onChange={handleInputChange}
                  style={{ fontWeight: "bold" }}
                >
                  <option value="">Select Color</option>
                  {Object.keys(colorOptions).map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                  <option value={"Custom Color"}>{"Custom Color"}</option>
                </select>
                {formData.modelColor3 === "Custom Color" && (
                  <input
                    type="text"
                    placeholder="Enter Color"
                    id="customColor3"
                    name="customColor3"
                    readOnly={localStorage.getItem("role") === "viewer"}
                    value={formData.customColor3}
                    onChange={(e) => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        customColor3: e.target.value,
                      }));
                    }}
                    style={{
                      maxWidth: "100%",
                      width: "6rem",
                      fontWeight: "bold",
                    }}
                  />
                )}
              </div>
              <div className="model-qty model-flex">
                <label htmlFor="model-qty" style={{ fontWeight: "bold" }}>
                  Qty:
                </label>
                <input
                  type="number"
                  name="modelQty3"
                  readOnly={localStorage.getItem("role") === "viewer"}
                  min={1}
                  value={formData.modelQty3}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Quantity"
                  style={{
                    width: "100%",
                    maxWidth: "3.8em",
                    fontWeight: "bold",
                  }}
                />
              </div>
              <div className="model-price model-flex">
                <label htmlFor="model-price" style={{ fontWeight: "bold" }}>
                  Price:
                </label>
                <input
                  type="text"
                  name="modelPrice3"
                  value={formData.modelPrice3}
                  onKeyPress={handleKeyPress}
                  readOnly={localStorage.getItem("role") === "viewer"}
                  onChange={handleInputChange}
                  placeholder="Enter Price"
                  style={{ fontWeight: "bold" }}
                />
              </div>
            </div>
            <div className="model-row">
              <div className="model-input model-flex">
                {/* <label htmlFor="model">Model:</label> */}
                <input
                  type="text"
                  name="model4"
                  readOnly={localStorage.getItem("role") === "viewer"}
                  value={formData.model4}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter model"
                  style={{ width: "10rem", fontWeight: "bold" }}
                />
              </div>
              <div className="model-color model-flex">
                <label htmlFor="model-color" style={{ fontWeight: "bold" }}>
                  Color:
                </label>
                <select
                  id="model-color"
                  name="modelColor4"
                  value={formData.modelColor4}
                  disabled={localStorage.getItem("role") === "viewer"}
                  onChange={handleInputChange}
                  style={{ fontWeight: "bold" }}
                >
                  <option value="">Select Color</option>
                  {Object.keys(colorOptions).map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                  <option value={"Custom Color"}>{"Custom Color"}</option>
                </select>
                {formData.modelColor4 === "Custom Color" && (
                  <input
                    type="text"
                    placeholder="Enter Color"
                    id="customColor4"
                    name="customColor4"
                    value={formData.customColor4}
                    readOnly={localStorage.getItem("role") === "viewer"}
                    onChange={(e) => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        customColor4: e.target.value,
                      }));
                    }}
                    style={{
                      maxWidth: "100%",
                      width: "6rem",
                      fontWeight: "bold",
                    }}
                  />
                )}
              </div>
              <div className="model-qty model-flex">
                <label htmlFor="model-qty" style={{ fontWeight: "bold" }}>
                  Qty:
                </label>
                <input
                  type="number"
                  name="modelQty4"
                  readOnly={localStorage.getItem("role") === "viewer"}
                  min={1}
                  value={formData.modelQty4}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Quantity"
                  style={{
                    width: "100%",
                    maxWidth: "3.8em",
                    fontWeight: "bold",
                  }}
                />
              </div>
              <div className="model-price model-flex">
                <label htmlFor="model-price" style={{ fontWeight: "bold" }}>
                  Price:
                </label>
                <input
                  type="text"
                  name="modelPrice4"
                  readOnly={localStorage.getItem("role") === "viewer"}
                  value={formData.modelPrice4}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Price"
                  style={{ fontWeight: "bold" }}
                />
              </div>
            </div>
            <div className="model-row">
              <div className="model-input model-flex">
                {/* <label htmlFor="model">Model:</label> */}
                <input
                  type="text"
                  name="model5"
                  value={formData.model5}
                  onChange={handleInputChange}
                  readOnly={localStorage.getItem("role") === "viewer"}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter model"
                  style={{ width: "10rem", fontWeight: "bold" }}
                />
              </div>
              <div className="model-color model-flex">
                <label htmlFor="model-color" style={{ fontWeight: "bold" }}>
                  Color:
                </label>
                <select
                  id="model-color"
                  name="modelColor5"
                  value={formData.modelColor5}
                  disabled={localStorage.getItem("role") === "viewer"}
                  onChange={handleInputChange}
                  style={{ fontWeight: "bold" }}
                >
                  <option value="">Select Color</option>
                  {Object.keys(colorOptions).map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                  <option value={"Custom Color"}>{"Custom Color"}</option>
                </select>
                {formData.modelColor5 === "Custom Color" && (
                  <input
                    type="text"
                    placeholder="Enter Color"
                    id="customColor5"
                    name="customColor5"
                    readOnly={localStorage.getItem("role") === "viewer"}
                    value={formData.customColor5}
                    onChange={(e) => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        customColor5: e.target.value,
                      }));
                    }}
                    style={{
                      maxWidth: "100%",
                      width: "6rem",
                      fontWeight: "bold",
                    }}
                  />
                )}
              </div>
              <div className="model-qty model-flex">
                <label htmlFor="model-qty" style={{ fontWeight: "bold" }}>
                  Qty:
                </label>
                <input
                  type="number"
                  name="modelQty5"
                  min={1}
                  readOnly={localStorage.getItem("role") === "viewer"}
                  value={formData.modelQty5}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Quantity"
                  style={{
                    width: "100%",
                    maxWidth: "3.8em",
                    fontWeight: "bold",
                  }}
                />
              </div>
              <div className="model-price model-flex">
                <label htmlFor="model-price" style={{ fontWeight: "bold" }}>
                  Price:
                </label>
                <input
                  type="text"
                  name="modelPrice5"
                  value={formData.modelPrice5}
                  readOnly={localStorage.getItem("role") === "viewer"}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Price"
                  style={{ fontWeight: "bold" }}
                />
              </div>
            </div>
            <div className="details-row">
              <div className="left-section">
                <div className="details-input">
                  <label htmlFor="details" style={{ fontWeight: "bold" }}>
                    Details:
                  </label>
                  <textarea
                    id="details"
                    name="details"
                    rows="5"
                    cols="60"
                    readOnly={localStorage.getItem("role") === "viewer"}
                    value={formData.details}
                    onChange={handleInputChange}
                    placeholder="Enter details here"
                    maxLength={320}
                    style={{ fontWeight: "bold" }}
                  ></textarea>
                </div>

                <div className="notes-input">
                  <label htmlFor="notes" style={{ fontWeight: "bold" }}>
                    Notes:
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="5"
                    cols="60"
                    readOnly={localStorage.getItem("role") === "viewer"}
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Enter notes here"
                    maxLength={320}
                    style={{ fontWeight: "bold" }}
                  ></textarea>
                </div>
                <div className="end-note">
                  <p>
                    Make all checks payable to Headstone World Houston.
                    <br />
                    <strong>
                      Customers are responsible for any cemetery fees.
                    </strong>
                    <br />
                    All purchases are not eligible for refunds or exchanges.
                    <br />
                    <br />
                    <strong>
                      Headstone World is not responsible for errors that appear
                      <br />
                      in signed and approved orders.
                    </strong>
                    <br />
                    <br />
                    Clarity of lasered images is not guaranteed for unapproved
                    <br />
                    resolutions of source images.
                    <br /> <br />
                    Headstone World is subject to shipping delays; time
                    estimates
                    <br />
                    are subject to change.
                    <br />
                    <br />
                    <strong>
                      Completed orders left for over 30 days are subject to a{" "}
                      <br />
                      storage fee.
                    </strong>
                  </p>
                </div>
              </div>
              <div className="right-section">
                <div className="total-inputs">
                  <div className="sub-total model-flex-right">
                    <label htmlFor="sub-total" style={{ fontWeight: "bold" }}>
                      Sub Total:
                    </label>
                    <input
                      type="number"
                      name="subTotal"
                      value={formData.subTotal}
                      onChange={handleInputChange}
                      readOnly
                      style={{ fontWeight: "bold" }}
                    />
                  </div>
                  <div className="tax model-flex-right">
                    <label htmlFor="tax" style={{ fontWeight: "bold" }}>
                      Tax:
                    </label>
                    <input
                      type="number"
                      name="tax"
                      value={formData.tax}
                      onChange={handleInputChange}
                      placeholder="8.25% of total"
                      readOnly
                      style={{ fontWeight: "bold" }}
                    />
                  </div>
                  <div className="delivery model-flex-right">
                    <label htmlFor="delivery" style={{ fontWeight: "bold" }}>
                      Stake/Delivery:
                    </label>
                    <input
                      type="number"
                      name="delivery"
                      value={formData.delivery}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter amount"
                      readOnly={localStorage.getItem("role") === "viewer"}
                      style={{ fontWeight: "bold" }}
                    />
                  </div>
                  <div className="foundation model-flex-right">
                    <label htmlFor="foundation" style={{ fontWeight: "bold" }}>
                      Setting/Foundation:
                    </label>
                    <input
                      type="number"
                      name="foundation"
                      value={formData.foundation}
                      onKeyPress={handleKeyPress}
                      onChange={handleInputChange}
                      placeholder="Enter amount"
                      readOnly={localStorage.getItem("role") === "viewer"}
                      style={{ fontWeight: "bold" }}
                    />
                  </div>
                  <div className="discount model-flex-right">
                    <label htmlFor="discount" style={{ fontWeight: "bold" }}>
                      Discount:
                    </label>
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onKeyPress={handleKeyPress}
                      onChange={handleInputChange}
                      readOnly={localStorage.getItem("role") === "viewer"}
                      style={{ fontWeight: "bold" }}
                    />
                  </div>
                  <div className="total model-flex-right">
                    <label htmlFor="total" style={{ fontWeight: "bold" }}>
                      Total
                    </label>
                    <input
                      type="number"
                      name="total"
                      value={formData.total}
                      onChange={handleInputChange}
                      readOnly
                      style={{ fontWeight: "bold" }}
                    />
                  </div>
                  <div className="deposit model-flex-right">
                    <label htmlFor="deposit" style={{ fontWeight: "bold" }}>
                      Deposit:
                    </label>
                    <input
                      type="number"
                      name="deposit"
                      value={formData.deposit}
                      onKeyPress={handleKeyPress}
                      onChange={handleInputChange}
                      placeholder="Enter amount"
                      readOnly={localStorage.getItem("role") === "viewer"}
                      style={{ fontWeight: "bold" }}
                    />
                  </div>
                  <div className="paymentMethod model-flex-right">
                    <label
                      htmlFor="paymentMethod"
                      style={{ fontWeight: "bold" }}
                    >
                      Payment Method:
                    </label>
                    <div
                      className=""
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: ".8rem",
                        paddingLeft: ".5rem",
                        fontWeight: "bold",
                      }}
                    >
                      <div className="">
                        <input
                          type="radio"
                          id="Credit"
                          name="paymentMethod"
                          disabled={localStorage.getItem("role") === "viewer"}
                          value="Credit"
                          checked={formData.paymentMethod === "Credit"}
                          onChange={handleInputChange}
                        />
                        <label
                          style={{ paddingLeft: ".2rem" }}
                          htmlFor="Credit"
                        >
                          Credit
                        </label>
                      </div>
                      <div className="">
                        <input
                          type="radio"
                          id="Check"
                          name="paymentMethod"
                          disabled={localStorage.getItem("role") === "viewer"}
                          value="Check"
                          checked={formData.paymentMethod === "Check"}
                          onChange={handleInputChange}
                        />
                        <label style={{ paddingLeft: ".2rem" }} htmlFor="Check">
                          Check
                        </label>
                      </div>
                      <div className="">
                        <input
                          type="radio"
                          id="Cash"
                          name="paymentMethod"
                          value="Cash"
                          disabled={localStorage.getItem("role") === "viewer"}
                          checked={formData.paymentMethod === "Cash"}
                          onChange={handleInputChange}
                        />
                        <label style={{ paddingLeft: ".2rem" }} htmlFor="Cash">
                          Cash
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="balance model-flex-right">
                    <label htmlFor="balance" style={{ fontWeight: "bold" }}>
                      Balance:
                    </label>
                    <input
                      type="number"
                      name="balance"
                      value={formData.balance}
                      onChange={handleInputChange}
                      readOnly
                      style={{ fontWeight: "bold" }}
                    />
                  </div>
                  <div
                    className="deposits model-flex-rght"
                    style={{ fontWeight: "bold" }}
                  >
                    {deposits.length > 0 &&
                      deposits
                        .slice(-4)
                        .reverse()
                        .map((dep, index) => (
                          <div key={index} className="deposit-item">
                            <p>
                              <b>Deposit {`${deposits.length - index}: `}</b>
                              {`$${dep.depositAmount}`} on {dep.date}{" "}
                              {`(${dep.paymentMethod})`}
                            </p>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            </div>
          </AccountsSection>
        </div>
      </form>
      <ImageModal
        isOpen={modalIsOpen}
        modalIndex={modalIndex}
        closeModal={handleCloseModal}
        handleImageSelect={handleImageSelect}
      />
      <SuccessModal
        isOpen={successModalIsOpen}
        onClose={handleSuccessModalClose}
        headStoneName={formData.headstoneName}
        invoiceNo={formData.invoiceNo}
        date={formData.date}
        customerName={formData.customerName}
        customerEmail={formData.customerEmail}
        customerPhone={formData.customerPhone}
        cemeteryName={formData.cemetery}
        cemeteryAddress={formData.cemeteryAddress}
        cemeteryContact={formData.cemeteryContact}
        lotNumber={formData.lotNumber}
        customCemetery={formData?.customCemetery}
        details={formData?.details}
        model1={formData?.model1}
        selectModelImage1={formData?.selectModelImage1}
        modelColor1={formData?.modelColor1}
        model2={formData?.model2}
        selectModelImage2={formData?.selectModelImage2}
        modelColor2={formData?.modelColor2}
        model3={formData?.model3}
        selectModelImage3={formData?.selectModelImage3}
        modelColor3={formData?.modelColor3}
        model4={formData?.model4}
        modelColor4={formData?.modelColor4}
        model5={formData?.model5}
        modelColor5={formData?.modelColor5}
      />
      {showPDF && <WorkOrderPDF />}
    </Container>
  );
};

export default InvoicehtmlForm;

const Container = styled.div`
  width: 900px;
  max-width: 1200px;
  margin: 0 auto;

  @media print {
    .nav-bar {
      display: none;
    }
    title {
      display: none;
    }
  }
`;

const NavBar = styled.nav`
  background: white;
  display: flex;
  height: 60px;
  padding: 15px;
  border: 2px solid grey;
  border-radius: 5px;
  border-top: none;
  justify-content: space-between;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #000;
`;

const UtilityContainer = styled.div`
  display: flex;
  gap: 30px;
`;

const HeadstoneInfoSection = styled.section`
  background: #eec843;
  .input-row {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
  }

  .input-row .flexy {
    flex: 1;
    text-align: right;
    margin-right: 10px;
  }

  .input-row input[type="text"],
  .input-row input[type="date"] {
    flex: 2;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
  }

  input[type="submit"] {
    background-color: #4caf50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  input[type="submit"]:hover {
    background-color: #45a049;
  }

  @media screen and (max-width: 480px) {
    .headstone-section {
      max-width: 100%;
    }

    .input-row {
      flex-wrap: wrap;
    }

    .input-row label,
    .input-row input[type="text"],
    .input-row input[type="date"] {
      flex: 100%;
    }

    input[type="submit"] {
      flex: 100%;
    }
  }
`;

const CemetrySection = styled.div`
  background: #5887fb;
  padding: 10px;

  table {
    width: 100%;
    border-collapse: collapse;
  }

  label {
    font-weight: normal;
  }
  th,
  td {
    padding: 5px;
    text-align: left;
    vertical-align: middle;
  }

  th {
    /* background-color: #f2f2f2; */
  }

  .input-row select,
  .input-row input[type="text"] {
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 3px;
    padding: 5px; /* Add padding for spacing */
  }

  .input-row select,
  .input-row input[type="text"]:focus {
    border: 1px solid #ccc;
  }

  @media screen and (max-width: 480px) {
    .input-row {
      display: block;
      margin-bottom: 10px;
    }

    .input-row select,
    .input-row input[type="text"] {
      width: 100%;
      border: 1px solid #ccc;
      padding: 5px; /* Add padding for spacing */
    }
  }
`;

const CustomerDetailsSection = styled.section`
  padding: 8px;
  background: #57facb;
  .row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 80%;
    margin: 0 auto;
  }

  .row label {
    margin-right: 20px;
  }

  .row input[type="text"],
  .row input[type="email"] {
    flex: 1;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
    margin-top: 10px;
  }

  @media screen and (max-width: 480px) {
    .customer-details-section {
      max-width: 100%;
    }

    .row label {
      flex-basis: auto;
      text-align: left;
    }
  }
`;

const AccountsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 15px;
  padding-bottom: 20px;
  background: #e7e9eb;
  .model-row {
    display: flex;
    justify-content: space-around;
  }
  .model-flex {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .model-row input,
  select {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
  }
  .details-row {
    display: flex;
    justify-content: space-around;
    gap: 28px;
  }
  .left-section {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 15px;
  }
  .details-input {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }

  #details {
    padding: 5px;
    resize: none;
  }

  .notes-input {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }

  #notes {
    padding: 5px;
    resize: none;
  }
  .grey-highlight {
    background-color: #b9b3b3;
  }
  .total-inputs input {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
  }
  .end-note {
    text-align: center;
  }
  .right-section {
    margin-top: 20px;
  }
  .right-section .total-inputs {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .model-flex-right {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .deposits {
    margin-top: 10px;
  }

  .deposit-item {
    margin-bottom: 5px;
  }
`;

const SelectModelButton = styled.button`
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px; /* Add a little spacing to the right */
`;

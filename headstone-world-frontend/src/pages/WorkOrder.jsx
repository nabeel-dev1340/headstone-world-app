import React from "react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import IconWithText from "../components/IconWithTExt";
import IconHome from "../assets/icons/home.png";
import IconSave from "../assets/icons/diskette.png";
import IconPrint from "../assets/icons/printing.png";
import ArtComponent from "../components/ArtComponent";
import EngravingArt from "../components/EngravingArt";
import InstallationForm from "../components/InstallationForm";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { generateGoogleMapsLink } from "../utils/get_maps_url";

const WorkOrder = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [workOrderSaved, setWorkOrderSaved] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [formData, setFormData] = useState({
    headStoneName: "",
    invoiceNo: "",
    username: "",
    date: "",
    customerEmail: "",
    customerName: "",
    customerPhone: "",
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
    cemeteryName: "",
    cemeteryAddress: "",
    cemeteryContact: "",
    lotNumber: "",
    details: "",
    model1: "",
    selectModelImage1: "",
    modelColor1: "",
    customColor1: "",
    model2: "",
    selectModelImage2: "",
    modelColor2: "",
    customColor2: "",
    model3: "",
    selectModelImage3: "",
    modelColor3: "",
    customColor3: "",
    model4: "",
    modelColor4: "",
    customColor4: "",
    model5: "",
    modelColor5: "",
    customColor5: "",
    cemeterySubmission: [],
    engravingSubmission: [],
    foundationInstall: [],
    monumentSetting: [],
    cemeteryApproval: [],
    finalArt: [],
  });

  const artComponentRef = useRef();
  const engravingArtRef = useRef();
  const installationFormRef = useRef();

  const triggerActionInChild = () => {
    // artComponentRef.current.submitToArt();
    engravingArtRef.current.submitToEngraving();
    installationFormRef.current.submitToFoundation();
    // submitToCemetery();
    setSubmissionSuccess(true);
  };

  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (location.state) {
      console.log(location.state);
      setFormData(location.state);
      if (location.state?.cemeteryName === "Other") {
        setFormData((prevData) => ({
          ...prevData,
          cemeteryName: location.state?.customCemetery || "",
          username: localStorage.getItem("username"),
        }));
      }
      // Set uploaded images to cemeterySubmission
      if (location.state.cemeterySubmission) {
        const sortedCemeterySubmission = location.state.cemeterySubmission.sort(
          (a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt)
        );
        const extractedBase64Images = sortedCemeterySubmission.map(
          (item) => item?.base64Data
        );
        setUploadedImages(extractedBase64Images);
      }
    }
  }, [location.state]);

  // const handleImageUpload = (e) => {
  //   const files = Array.from(e.target.files);

  //   // Convert uploaded images to base64 strings and store them
  //   const base64Images = [];

  //   const loadImages = async () => {
  //     for (const file of files) {
  //       const reader = new FileReader();
  //       reader.onload = () => {
  //         base64Images.push(reader.result);
  //         if (base64Images.length === files.length) {
  //           // When all images are loaded, update the state
  //           setUploadedImages((prevImages) => [...prevImages, ...base64Images]);
  //         }
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   };

  //   loadImages();
  // };

  // const removeThumbnail = (index) => {
  //   const updatedImages = [...uploadedImages];
  //   updatedImages.splice(index, 1);
  //   setUploadedImages(updatedImages);
  // };

  // const handlePrint = () => {
  //   document.title = "Computerized Print";
  //   window.print();
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingOrder(true);
      // Hide the input elements before capturing the screenshot
      const inputElements = document.querySelectorAll("input[type='file']");
      inputElements.forEach((input) => {
        input.style.display = "none";
      });

      // Capture the form as an image using html2canvas
      const canvas = await html2canvas(document.getElementById("work-order"));

      // Restore the visibility of input elements
      inputElements.forEach((input) => {
        input.style.display = "block";
      });

      // Convert the captured canvas to a Blob
      canvas.toBlob(async (blob) => {
        // Create a FormData object to send data to the server
        const formDataToSend = new FormData();
        formDataToSend.append(
          "workOrder",
          blob,
          `${formData.headStoneName}..${formData.invoiceNo}.png`
        );
        // Append each field of formData to finalFormData
        for (const key in formData) {
          if (formData.hasOwnProperty(key)) {
            formDataToSend.append(key, formData[key]);
          }
        }
        console.log(formDataToSend);
        formDataToSend.append("username", localStorage.getItem("username"));

        formDataToSend.append("cemeteryDate", formData.cemeteryDate);
        formDataToSend.append("cemeteryFollowUp1", formData.cemeteryFollowUp1);
        formDataToSend.append("cemeteryFollowUp2", formData.cemeteryFollowUp2);
        formDataToSend.append(
          "cemeteryApprovedDate",
          formData.cemeteryApprovedDate
        );
        // formDataToSend.append("cemeteryNotes", formData.cemeteryNotes);

        formDataToSend.append("photoDate", formData.photoDate);
        formDataToSend.append("photoFollowUp1", formData.photoFollowUp1);
        formDataToSend.append("photoFollowUp2", formData.photoFollowUp2);
        formDataToSend.append("photoApprovedDate", formData.photoApprovedDate);
        // formDataToSend.append("photoNotes", formData.photoNotes);

        formDataToSend.append("bronzeDate", formData.bronzeDate);
        formDataToSend.append("bronzeFollowUp1", formData.bronzeFollowUp1);
        formDataToSend.append("bronzeFollowUp2", formData.bronzeFollowUp2);
        formDataToSend.append(
          "bronzeApprovedDate",
          formData.bronzeApprovedDate
        );
        // formDataToSend.append("bronzeNotes", formData.bronzeNotes);

        // formDataToSend.append("notes", formData.notes);
        // console.log("testing", formDataToSend);

        // Make a POST API call to the /work-order endpoint
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/work-order`,
          {
            method: "POST",
            headers: {
              "ngrok-skip-browser-warning": "69420",
            },
            body: formDataToSend,
          }
        );

        if (response.ok) {
          console.log("Work order submission successful!");
          setWorkOrderSaved(true);
          // Optionally, you can redirect or show a success message here
        } else {
          console.error("Work order submission failed.");
          // Handle the error, show an error message, or retry the submission
        }
        setSavingOrder(false); // Stop the saving process
      }, "image/png");
    } catch (error) {
      console.error("Error while submitting work order:", error);
      // Handle the error, show an error message, or retry the submission
      setSavingOrder(false); // Stop the saving process
    }
  };

  // const submitToCemetery = async () => {
  //   try {
  //     const formDataToSend = new FormData();

  //     formDataToSend.append("headStoneName", formData.headStoneName);
  //     formDataToSend.append("invoiceNo", formData.invoiceNo);

  //     // Convert base64 strings to Blobs and append them
  //     uploadedImages.forEach((base64Image, index) => {
  //       const blob = dataURLtoBlob(base64Image);
  //       formDataToSend.append("images", blob, `image${index}.png`);
  //     });

  //     // Make the API call
  //     const response = await fetch(
  //       `${process.env.REACT_APP_API_URL}/submit-to-cemetery`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "ngrok-skip-browser-warning": "69420",
  //         },
  //         body: formDataToSend,
  //       }
  //     );

  //     if (response.ok) {
  //       console.log("Submission to Cemetery successful!");
  //       // setSubmissionSuccess(true);
  //       // Optionally, you can redirect or show a success message here
  //     } else {
  //       console.error("Submission to Cemetery failed.");
  //       // Handle the error, show an error message, or retry the submission
  //     }
  //   } catch (error) {
  //     console.error("Error while submitting to Cemetery:", error);
  //     // Handle the error, show an error message, or retry the submission
  //   }
  // };

  function dataURLtoBlob(dataURL) {
    const parts = dataURL.split(",");
    const contentType = parts[0].split(";")[0].split(":")[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uint8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; i++) {
      uint8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uint8Array], { type: contentType });
  }

  const closeModal = () => {
    setWorkOrderSaved(false);
  };

  const handleThumbnailClick = (image) => {
    setSelectedImage(image);
  };

  const closeModalImg = () => {
    setSelectedImage(null);
  };

  function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{
          display: "block",
          background: "orange",
          paddingTop: ".1rem",
          borderRadius: "50%",
        }}
        onClick={onClick}
      />
    );
  }

  function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{
          display: "block",
          background: "orange",
          paddingTop: ".1rem",
          borderRadius: "50%",
        }}
        onClick={onClick}
      />
    );
  }

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: calculateSlidesToShow(),
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  function calculateSlidesToShow() {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 1200) {
      return Math.min(7, uploadedImages.length);
    } else if (screenWidth >= 768) {
      return Math.min(5, uploadedImages.length);
    } else {
      return Math.min(3, uploadedImages.length);
    }
  }
  return (
    <Container>
      <NavBar className="nav-bar">
        <StyledLink to="/landing-page">
          <IconWithText iconSrc={IconHome} text="Home" />
        </StyledLink>
        <UtilityContainer>
          {localStorage.getItem("role") !== "viewer" ? (
            <IconWithText
              iconSrc={IconSave}
              type="submit"
              text={
                savingOrder ? "Saving..." : workOrderSaved ? "Saved" : "Save"
              }
              onClick={handleSubmit}
            />
          ) : null}

          {/* <IconWithText
            iconSrc={IconPrint}
            type="button"
            onClick={handlePrint}
            text="Print"
          /> */}
        </UtilityContainer>
      </NavBar>
      <div id="work-order">
        <Header>
          <HeadstoneName>{formData.headStoneName}</HeadstoneName>
          <Details>
            <Detail>
              <DetailTitle>Invoice No:</DetailTitle>
              <DetailValue>{formData.invoiceNo}</DetailValue>
            </Detail>
            <Detail>
              <DetailTitle>Date:</DetailTitle>
              <DetailValue>{formData.date}</DetailValue>
            </Detail>
          </Details>
          <CustomerDetails>
            <Detail>
              <DetailTitle>Customer Name:</DetailTitle>
              <DetailValue>{formData.customerName}</DetailValue>
            </Detail>
            <Detail>
              <DetailTitle>Email:</DetailTitle>
              <DetailValue>{formData.customerEmail}</DetailValue>
            </Detail>
            <Detail>
              <DetailTitle>Phone Number:</DetailTitle>
              <DetailValue>{formData.customerPhone}</DetailValue>
            </Detail>
          </CustomerDetails>
        </Header>
        <CustomerDesign>
          <SectionTitle>Customer Design Approval</SectionTitle>
          <DesignForm>
            <InputLabel>Design Approved by Customer</InputLabel>
            {/* {localStorage.getItem("role") !== "viewer" ? (
              <ImageInput
                type="file"
                name="images"
                multiple
                onChange={handleImageUpload}
              />
            ) : null} */}
            <div style={{ padding: "1rem" }}>
              <Slider {...settings}>
                {uploadedImages &&
                  uploadedImages.slice().map((image, index) => (
                    <div key={index} className="thumbnail-container">
                      {/* {localStorage.getItem("role") !== "viewer" ? (
                      <span
                        className="delete-button"
                        onClick={() => removeThumbnail(index)}
                      >
                        &#x2716;
                      </span>
                    ) : null} */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <Thumbnail
                          className="thumbnail"
                          src={image}
                          alt="Non-Image file"
                          onClick={() => handleThumbnailClick(image)}
                        />
                      </div>
                      {/* {formData.cemeterySubmission &&
                          formData.cemeterySubmission[index] && (
                            <ModifiedDate>
                              Modified:{" "}
                              {new Date(
                                formData.cemeterySubmission[index].modifiedAt
                              ).toLocaleString()}
                            </ModifiedDate>
                          )} */}

                      {formData.cemeterySubmission &&
                        formData.cemeterySubmission[index] && (
                          <ModifiedDate>
                            {new Date(
                              formData.cemeterySubmission[index].modifiedAt
                            ).toLocaleDateString()}
                          </ModifiedDate>
                        )}
                    </div>
                  ))}
              </Slider>
            </div>

            {/* Modal for enlarged image */}
            {selectedImage && (
              <ModalOverlay onClick={closeModalImg}>
                <CloseButton onClick={closeModalImg}>X</CloseButton>
                <EnlargedImage src={selectedImage} alt="Enlarged Thumbnail" />
              </ModalOverlay>
            )}
            {/* {localStorage.getItem("role") !== "viewer" ? (
              <SubmitButton
                type="button"
                onClick={submitToCemetery}
                disabled={uploadedImages.length <= 0 || submissionSuccess}
              >
                {submissionSuccess ? "Submitted" : "Submit to Cemetery"}
              </SubmitButton>
            ) : null} */}
          </DesignForm>
        </CustomerDesign>
        <ArtComponent
          headStoneName={formData.headStoneName}
          invoiceNo={formData.invoiceNo}
          finalArt={location.state?.finalArt || []}
          cemeteryApproval={location.state?.cemeteryApproval || []}
          ref={artComponentRef}
        />
        <EngravingArt
          headStoneName={formData.headStoneName}
          invoiceNo={formData.invoiceNo}
          oldEngravingImage={location.state?.engravingSubmission || []}
          ref={engravingArtRef}
        />

        <ModelInfo>
          <SectionTitle>Models Information</SectionTitle>
          <ModelGrid>
            {formData.model1 && (
              <ModelDetail>
                <img
                  src={formData.model1}
                  style={{
                    width: "120px",
                    height: "85px",
                    paddingBottom: "1rem",
                  }}
                  alt="Selected Model"
                />
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <ModelTitle style={{ paddingRight: "1rem" }}>
                    Model Name:{" "}
                  </ModelTitle>
                  <DetailValue>{formData.selectModelImage1}</DetailValue>{" "}
                </div>

                <div style={{ display: "flex", flexDirection: "row" }}>
                  <ModelTitle style={{ paddingRight: "1rem" }}>
                    Model Color:{" "}
                  </ModelTitle>
                  {formData.modelColor1 === "Custom Color" ? (
                    <DetailValue>{formData.customColor1}</DetailValue>
                  ) : (
                    <DetailValue>{formData.modelColor1}</DetailValue>
                  )}
                </div>
              </ModelDetail>
            )}

            {formData.model2 && (
              <ModelDetail>
                <img
                  src={formData.model2}
                  style={{
                    width: "120px",
                    height: "85px",
                    paddingBottom: "1rem",
                  }}
                  alt="Selected Model"
                />
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <ModelTitle style={{ paddingRight: "1rem" }}>
                    Model Name:{" "}
                  </ModelTitle>
                  <DetailValue>{formData.selectModelImage2}</DetailValue>{" "}
                </div>

                <div style={{ display: "flex", flexDirection: "row" }}>
                  <ModelTitle style={{ paddingRight: "1rem" }}>
                    Model Color:{" "}
                  </ModelTitle>
                  {formData.modelColor2 === "Custom Color" ? (
                    <DetailValue>{formData.customColor2}</DetailValue>
                  ) : (
                    <DetailValue>{formData.modelColor2}</DetailValue>
                  )}
                </div>
              </ModelDetail>
            )}

            {formData.model3 && (
              <ModelDetail>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <ModelTitle style={{ paddingRight: "1rem" }}>
                    Model Name:{" "}
                  </ModelTitle>
                  <DetailValue>{formData.model3}</DetailValue>{" "}
                </div>

                <div style={{ display: "flex", flexDirection: "row" }}>
                  <ModelTitle style={{ paddingRight: "1rem" }}>
                    Model Color:{" "}
                  </ModelTitle>
                  {formData.modelColor3 === "Custom Color" ? (
                    <DetailValue>{formData.customColor3}</DetailValue>
                  ) : (
                    <DetailValue>{formData.modelColor3}</DetailValue>
                  )}
                </div>
              </ModelDetail>
            )}

            {formData.model4 && (
              <ModelDetail>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <ModelTitle style={{ paddingRight: "1rem" }}>
                    Model Name:{" "}
                  </ModelTitle>
                  <DetailValue>{formData.model4}</DetailValue>{" "}
                </div>

                <div style={{ display: "flex", flexDirection: "row" }}>
                  <ModelTitle style={{ paddingRight: "1rem" }}>
                    Model Color:{" "}
                  </ModelTitle>
                  {formData.modelColor4 === "Custom Color" ? (
                    <DetailValue>{formData.customColor4}</DetailValue>
                  ) : (
                    <DetailValue>{formData.modelColor4}</DetailValue>
                  )}
                </div>
              </ModelDetail>
            )}

            {formData.model5 && (
              <ModelDetail>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <ModelTitle style={{ paddingRight: "1rem" }}>
                    Model Name:{" "}
                  </ModelTitle>
                  <DetailValue>{formData.model5}</DetailValue>{" "}
                </div>

                <div style={{ display: "flex", flexDirection: "row" }}>
                  <ModelTitle style={{ paddingRight: "1rem" }}>
                    Model Color:{" "}
                  </ModelTitle>
                  {formData.modelColor5 === "Custom Color" ? (
                    <DetailValue>{formData.customColor5}</DetailValue>
                  ) : (
                    <DetailValue>{formData.modelColor5}</DetailValue>
                  )}
                </div>
              </ModelDetail>
            )}
          </ModelGrid>

          <ModelDetail>
            <ModelTitle style={{ paddingRight: "1rem" }}>Details:</ModelTitle>
            <DetailValue>{formData.details}</DetailValue>
          </ModelDetail>
        </ModelInfo>

        <Requests>
          <SectionTitle>Requests</SectionTitle>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#A9A9A9",
              padding: "5px",
              paddingTop: "15px",
              marginTop: "10px",
              paddingBottom: "15px",
              marginBottom: "20px",
              borderRadius: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              <div>
                <label
                  style={{
                    marginRight: "3px",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  Cemetery
                </label>
                <input
                  style={{
                    fontWeight: "bold",
                    padding: "4px",
                    border: "solid black 2px",
                  }}
                  type="date"
                  readOnly={localStorage.getItem("role") === "viewer"}
                  value={formData.cemeteryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, cemeteryDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    marginRight: "3px",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  Follow up
                </label>
                <input
                  style={{
                    fontWeight: "bold",
                    padding: "4px",
                    border: "solid black 2px",
                  }}
                  type="date"
                  value={formData.cemeteryFollowUp1}
                  readOnly={localStorage.getItem("role") === "viewer"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cemeteryFollowUp1: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    marginRight: "3px",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  Follow up
                </label>
                <input
                  style={{
                    fontWeight: "bold",
                    padding: "4px",
                    border: "solid black 2px",
                  }}
                  type="date"
                  readOnly={localStorage.getItem("role") === "viewer"}
                  value={formData.cemeteryFollowUp2}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cemeteryFollowUp2: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    marginRight: "3px",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  Approved
                </label>
                <input
                  style={{
                    fontWeight: "bold",
                    padding: "4px",
                    border: "solid black 2px",
                  }}
                  type="date"
                  readOnly={localStorage.getItem("role") === "viewer"}
                  value={formData.cemeteryApprovedDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cemeteryApprovedDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div style={{ display: "flex", marginTop: "15px" }}>
              <label
                htmlFor="notes"
                style={{
                  marginRight: "3px",
                  fontWeight: "bold",
                  fontSize: "15px",
                }}
              >
                Notes
              </label>
              <textarea
                id="cemeteryNotes"
                name="cemeteryNotes"
                rows="3"
                cols="85"
                readOnly={localStorage.getItem("role") === "viewer"}
                value={formData.cemeteryNotes}
                onChange={(e) =>
                  setFormData({ ...formData, cemeteryNotes: e.target.value })
                }
                placeholder="Enter notes here"
                maxLength={360}
                style={{
                  fontWeight: "bold",
                  border: "solid black 2px",
                  borderRadius: "10px",
                  padding: "5px",
                  maxWidth: "100%",
                }}
              ></textarea>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#A9A9A9",
              padding: "5px",
              paddingTop: "15px",
              marginTop: "10px",
              paddingBottom: "15px",
              marginBottom: "20px",
              borderRadius: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "12px" }}>
              <div>
                <label
                  style={{
                    marginRight: "3px",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  Photo
                </label>
                <input
                  style={{
                    fontWeight: "bold",
                    padding: "4px",
                    border: "solid black 2px",
                  }}
                  type="date"
                  readOnly={localStorage.getItem("role") === "viewer"}
                  value={formData.photoDate}
                  onChange={(e) =>
                    setFormData({ ...formData, photoDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    marginRight: "3px",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  Follow up
                </label>
                <input
                  style={{
                    fontWeight: "bold",
                    padding: "4px",
                    border: "solid black 2px",
                  }}
                  type="date"
                  value={formData.photoFollowUp1}
                  readOnly={localStorage.getItem("role") === "viewer"}
                  onChange={(e) =>
                    setFormData({ ...formData, photoFollowUp1: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    marginRight: "3px",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  Follow up
                </label>
                <input
                  style={{
                    fontWeight: "bold",
                    padding: "4px",
                    border: "solid black 2px",
                  }}
                  type="date"
                  readOnly={localStorage.getItem("role") === "viewer"}
                  value={formData.photoFollowUp2}
                  onChange={(e) =>
                    setFormData({ ...formData, photoFollowUp2: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    marginRight: "3px",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  Approved
                </label>
                <input
                  style={{
                    fontWeight: "bold",
                    padding: "4px",
                    border: "solid black 2px",
                  }}
                  type="date"
                  readOnly={localStorage.getItem("role") === "viewer"}
                  value={formData.photoApprovedDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      photoApprovedDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div style={{ display: "flex", marginTop: "15px" }}>
              <label
                htmlFor="notes"
                style={{
                  marginRight: "3px",
                  fontWeight: "bold",
                  fontSize: "15px",
                }}
              >
                Notes
              </label>
              <textarea
                id="photoNotes"
                name="photoNotes"
                rows="3"
                cols="85"
                readOnly={localStorage.getItem("role") === "viewer"}
                value={formData.photoNotes}
                onChange={(e) =>
                  setFormData({ ...formData, photoNotes: e.target.value })
                }
                placeholder="Enter notes here"
                maxLength={360}
                style={{
                  fontWeight: "bold",
                  border: "solid black 2px",
                  borderRadius: "10px",
                  padding: "5px",
                  maxWidth: "100%",
                }}
              ></textarea>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#A9A9A9",
              padding: "5px",
              paddingTop: "15px",
              marginTop: "10px",
              paddingBottom: "15px",
              marginBottom: "10px",
              borderRadius: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "12px" }}>
              <div>
                <label
                  style={{
                    marginRight: "3px",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  Bronze
                </label>
                <input
                  style={{
                    fontWeight: "bold",
                    padding: "4px",
                    border: "solid black 2px",
                  }}
                  type="date"
                  readOnly={localStorage.getItem("role") === "viewer"}
                  value={formData.bronzeDate}
                  onChange={(e) =>
                    setFormData({ ...formData, bronzeDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    marginRight: "3px",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  Follow up
                </label>
                <input
                  style={{
                    fontWeight: "bold",
                    padding: "4px",
                    border: "solid black 2px",
                  }}
                  type="date"
                  value={formData.bronzeFollowUp1}
                  readOnly={localStorage.getItem("role") === "viewer"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bronzeFollowUp1: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    marginRight: "3px",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  Follow up
                </label>
                <input
                  style={{
                    fontWeight: "bold",
                    padding: "4px",
                    border: "solid black 2px",
                  }}
                  type="date"
                  readOnly={localStorage.getItem("role") === "viewer"}
                  value={formData.bronzeFollowUp2}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bronzeFollowUp2: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    marginRight: "3px",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  Approved
                </label>
                <input
                  style={{
                    fontWeight: "bold",
                    padding: "4px",
                    border: "solid black 2px",
                  }}
                  type="date"
                  readOnly={localStorage.getItem("role") === "viewer"}
                  value={formData.bronzeApprovedDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bronzeApprovedDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div style={{ display: "flex", marginTop: "15px" }}>
              <label
                htmlFor="notes"
                style={{
                  marginRight: "3px",
                  fontWeight: "bold",
                  fontSize: "15px",
                }}
              >
                Notes
              </label>
              <textarea
                id="bronzeNotes"
                name="bronzeNotes"
                rows="3"
                cols="85"
                readOnly={localStorage.getItem("role") === "viewer"}
                value={formData.bronzeNotes}
                onChange={(e) =>
                  setFormData({ ...formData, bronzeNotes: e.target.value })
                }
                placeholder="Enter notes here"
                maxLength={360}
                style={{
                  fontWeight: "bold",
                  border: "solid black 2px",
                  borderRadius: "10px",
                  padding: "5px",
                  maxWidth: "100%",
                }}
              ></textarea>
            </div>
          </div>
        </Requests>

        <CemeteryInfo>
          <SectionTitle>Cemetery Information</SectionTitle>
          <CemeteryDetail>
            <DetailTitle>Cemetery Name:</DetailTitle>
            <DetailValue>{formData.cemeteryName}</DetailValue>
          </CemeteryDetail>
          <CemeteryDetail>
            <DetailTitle>Cemetery Address:</DetailTitle>
            <DetailValue>
              <a
                href={generateGoogleMapsLink(formData.cemeteryAddress)}
                target="blank"
              >
                {formData.cemeteryAddress}
              </a>
            </DetailValue>
          </CemeteryDetail>
          <CemeteryDetail>
            <DetailTitle>Cemetery Contact:</DetailTitle>
            <DetailValue>{formData.cemeteryContact}</DetailValue>
          </CemeteryDetail>
          <CemeteryDetail>
            <DetailTitle>Lot Number:</DetailTitle>
            <DetailValue>{formData.lotNumber}</DetailValue>
          </CemeteryDetail>
          <InstallationForm
            headStoneName={formData.headStoneName}
            invoiceNo={formData.invoiceNo}
            foundationInstall={location.state?.foundationInstall || []}
            monumentSetting={location.state?.monumentSetting || []}
            ref={installationFormRef}
          />
        </CemeteryInfo>
        {localStorage.getItem("role") !== "viewer" ? (
          <SubmitButton
            type="button"
            onClick={triggerActionInChild}
            style={{
              marginLeft: "1rem",
              marginBottom: "2rem",
            }}
          >
            {submissionSuccess ? "Submitted" : "Submit to Upload"}
          </SubmitButton>
        ) : null}
      </div>
      {workOrderSaved && (
        <SuccessModal>
          <SuccessModalContent>
            <h2>Work Order Saved Successfully</h2>
            <button onClick={closeModal}>Close</button>
          </SuccessModalContent>
        </SuccessModal>
      )}
    </Container>
  );
};

export default WorkOrder;

const Container = styled.div`
  width: 100%;
  max-width: 900px;
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

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #000;
`;

const NavBar = styled.nav`
  background: white;
  display: flex;
  align-items: center;
  padding: 15px;
  border: 2px solid grey;
  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const UtilityContainer = styled.div`
  display: flex;
  gap: 30px;
  margin-left: auto;
`;

const Header = styled.div`
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const HeadstoneName = styled.h2`
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
`;

const Details = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin-top: 20px;
`;

const CustomerDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 30px;
  margin-top: 20px;
`;

const Detail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DetailTitle = styled.h3`
  font-size: 16px;
  color: #777;
  margin-bottom: 5px;
`;

const ModelTitle = styled.h3`
  font-size: 16px;
  color: #000;
  margin-bottom: 5px;
`;

const DetailValue = styled.p`
  font-size: 18px;
  color: #333;
`;

const CustomerDesign = styled.div`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  background: #57facb;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 24px;
  color: #000;
  margin-bottom: 15px;
`;

const DesignForm = styled.div`
  margin-top: 20px;
`;

const InputLabel = styled.label`
  font-size: 16px;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 10px;
`;

const ImageInput = styled.input`
  display: block;
  margin-bottom: 10px;
`;

const ImagePreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  .thumbnail-container {
    position: relative;
    margin: 5px;
  }

  .thumbnail {
    max-width: 100px;
    max-height: 100px;
    border: 1px solid #ddd;
  }

  .delete-button {
    position: absolute;
    top: 5px;
    right: 5px;
    cursor: pointer;
    color: #f00; /* Red color */
    font-size: 20px;
  }
`;

const Thumbnail = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 5px;
  margin: 10px;
  cursor: pointer;
`;

const SubmitButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

const CemeteryInfo = styled.div`
  background: #f5f5f5;
  width: 100%;
  margin: 20px auto;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

const ModelInfo = styled.div`
  background: #e0e6aa;
  width: 100%;
  margin: 20px auto;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

const Requests = styled.div`
  background: #45b6;
  width: 100%;
  margin: 20px auto;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

const ModelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two columns with equal width */
  gap: 10px; /* Adjust the gap between grid items */
`;

const CemeteryDetail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const ModelDetail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15px;

  @media (min-width: 768px) {
    flex-direction: column;
    justify-content: flex-start;
  }
`;

const SuccessModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const SuccessModalContent = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  max-width: 400px; /* Adjust the width as needed */
  text-align: center;

  h2 {
    font-size: 24px;
    color: #333;
    margin-bottom: 15px;
  }

  button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #0056b3;
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const EnlargedImage = styled.img`
  max-width: 75%;
  max-height: 75%;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 30px;
  right: 30px;
  background-color: transparent;
  border: none;
  color: red;
  font-size: 30px;
  font-weight: bold;
  cursor: pointer;
`;

const ModifiedDate = styled.div`
  font-size: 0.8rem;
  margin-top: 0.5rem;
  color: gray;
  text-align: center;
`;

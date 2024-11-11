import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styled from "styled-components";

const InstallationForm = forwardRef(
  ({ headStoneName, invoiceNo, foundationInstall, monumentSetting }, ref) => {
    const [foundationInstallImagesBase64, setFoundationInstallImagesBase64] =
      useState([]);
    const [monumentSettingImagesBase64, setMonumentSettingImagesBase64] =
      useState([]);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
      if (foundationInstall && foundationInstall.length > 0) {
        const sortedFoundationInstall = foundationInstall.sort(
          (a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt)
        );
        const extractedBase64Images = sortedFoundationInstall.map(
          (item) => item?.base64Data
        );
        setFoundationInstallImagesBase64(extractedBase64Images);
      }
      if (monumentSetting && monumentSetting.length > 0) {
        const sortedMonumentSetting = monumentSetting.sort(
          (a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt)
        );
        const extractedBase64MonumentImages = sortedMonumentSetting.map(
          (item) => item?.base64Data
        );
        setMonumentSettingImagesBase64(extractedBase64MonumentImages);
      }
    }, [foundationInstall, monumentSetting]);

    const handleFoundationInstallUpload = (e) => {
      const files = Array.from(e.target.files);

      const loadImages = async () => {
        for (const file of files) {
          const reader = new FileReader();

          reader.onload = () => {
            setFoundationInstallImagesBase64((prevImages) => [
              ...prevImages,
              reader.result,
            ]);
          };

          reader.readAsDataURL(file);
        }
      };

      loadImages();
    };

    const handleMonumentSettingUpload = (e) => {
      const files = Array.from(e.target.files);

      const loadImages = async () => {
        for (const file of files) {
          const reader = new FileReader();

          reader.onload = () => {
            setMonumentSettingImagesBase64((prevImages) => [
              ...prevImages,
              reader.result,
            ]);
          };

          reader.readAsDataURL(file);
        }
      };

      loadImages();
    };

    const removeFoundationImage = (index) => {
      const updatedImages = [...foundationInstallImagesBase64];
      updatedImages.splice(index, 1);
      setFoundationInstallImagesBase64(updatedImages);
    };

    const removeMonumentImage = (index) => {
      const updatedImages = [...monumentSettingImagesBase64];
      updatedImages.splice(index, 1);
      setMonumentSettingImagesBase64(updatedImages);
    };

    useImperativeHandle(ref, () => ({
      submitToFoundation: async (e) => {
        // e.preventDefault();

        if (
          foundationInstallImagesBase64.length > 0 ||
          monumentSettingImagesBase64.length > 0
        ) {
          try {
            const formDataToSend = new FormData();
            formDataToSend.append("headstoneName", headStoneName);
            formDataToSend.append("invoiceNo", invoiceNo);
            formDataToSend.append(
              "foundationImagesLength",
              foundationInstallImagesBase64.length
            );
            formDataToSend.append(
              "monumentImagesLength",
              monumentSettingImagesBase64.length
            );

            // Append foundation install images
            foundationInstallImagesBase64.forEach((base64Image, index) => {
              const blob = dataURLtoBlob(base64Image);
              formDataToSend.append(
                `foundationInstallImages`,
                blob,
                `image${index}.png`
              );
            });

            // Append monument setting images
            monumentSettingImagesBase64.forEach((base64Image, index) => {
              const blob = dataURLtoBlob(base64Image);
              formDataToSend.append(
                `foundationInstallImages`,
                blob,
                `image${index}.png`
              );
            });

            // Make a POST request to your API endpoint
            const response = await fetch(
              `${process.env.REACT_APP_API_URL}/foundation-submission`,
              {
                method: "POST",
                headers: {
                  "ngrok-skip-browser-warning": "69420",
                },
                body: formDataToSend,
              }
            );

            if (response.ok) {
              // Handle successful response (e.g., show a success message)
              console.log("Foundation/Setting submission successful!");
              setSubmissionSuccess(true);
            } else {
              // Handle error response
              console.error("Foundation/Setting submission failed.");
            }
          } catch (error) {
            console.error("Error submitting Foundation/Setting:", error);
          }
        } else {
          console.log("No images uploaded..");
        }
      },
    }));

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
            background: "lightblue",
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
            background: "lightblue",
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
        return Math.min(7, foundationInstallImagesBase64.length);
      } else if (screenWidth >= 768) {
        return Math.min(5, foundationInstallImagesBase64.length);
      } else {
        return Math.min(3, foundationInstallImagesBase64.length);
      }
    }

    const settings2 = {
      dots: true,
      infinite: false,
      speed: 500,
      slidesToShow: calculateSlidesToShow2(),
      slidesToScroll: 1,
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,
    };

    function calculateSlidesToShow2() {
      const screenWidth = window.innerWidth;
      if (screenWidth >= 1200) {
        return Math.min(7, monumentSettingImagesBase64.length);
      } else if (screenWidth >= 768) {
        return Math.min(5, monumentSettingImagesBase64.length);
      } else {
        return Math.min(3, monumentSettingImagesBase64.length);
      }
    }

    return (
      <FormContainer>
        <InputLabel>Foundation Install</InputLabel>
        {localStorage.getItem("role") !== "viewer" ? (
          <ImageInput
            type="file"
            name="foundationInstallImages"
            multiple
            onChange={handleFoundationInstallUpload}
          />
        ) : null}

        <div style={{ padding: "1rem" }}>
          <Slider {...settings}>
            {foundationInstallImagesBase64
              .slice()

              .map((image, index) => (
                <div key={index} className="thumbnail-container">
                  {/* {localStorage.getItem("role") !== "viewer" ? (
              <span
                className="delete-button"
                onClick={() => removeFoundationImage(index)}
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
                      src={image}
                      alt="Non-image file"
                      onClick={() => handleThumbnailClick(image)}
                    />
                  </div>
                  {foundationInstall && foundationInstall[index] && (
                    <ModifiedDate>
                      {new Date(
                        foundationInstall[index].modifiedAt
                      ).toLocaleDateString()}
                    </ModifiedDate>
                  )}
                </div>
              ))}
          </Slider>
        </div>
        {selectedImage && (
          <ModalOverlay onClick={closeModalImg}>
            <CloseButton onClick={closeModalImg}>X</CloseButton>
            <EnlargedImage src={selectedImage} alt="Enlarged Thumbnail" />
          </ModalOverlay>
        )}
        <InputLabel>Monument Setting</InputLabel>
        {localStorage.getItem("role") !== "viewer" ? (
          <ImageInput
            type="file"
            name="monumentSettingImages"
            multiple // Allow multiple monument setting images
            onChange={handleMonumentSettingUpload}
          />
        ) : null}

        <div style={{ padding: "1rem" }}>
          <Slider {...settings2}>
            {/* Display monument setting images */}
            {monumentSettingImagesBase64.slice().map((image, index) => (
              <div key={index} className="thumbnail-container">
                {/* {localStorage.getItem("role") !== "viewer" ? (
              <span
                className="delete-button"
                onClick={() => removeMonumentImage(index)}
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
                    src={image}
                    alt="Non-image file"
                    onClick={() => handleThumbnailClick(image)}
                  />
                </div>
                {monumentSetting && monumentSetting[index] && (
                  <ModifiedDate>
                    {new Date(
                      monumentSetting[index].modifiedAt
                    ).toLocaleDateString()}
                  </ModifiedDate>
                )}
              </div>
            ))}
          </Slider>
        </div>
        {/* {localStorage.getItem("role") !== "viewer" ? (
          <SubmitButton type="button" onClick={submitToFoundation}>
            {submissionSuccess ? "Submitted" : "Submit to Upload"}
          </SubmitButton>
        ) : null} */}
      </FormContainer>
    );
  }
);

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

const FormContainer = styled.div`
  margin-top: 20px;
`;

const InputLabel = styled.label`
  font-size: 16px;
  color: #333;
  display: block;
  font-weight: bold;
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

export default InstallationForm;

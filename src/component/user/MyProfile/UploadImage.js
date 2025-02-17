import React, { useState } from "react";
import AvatarEditor from "react-avatar-editor";
import { useDropzone } from "react-dropzone";
import defaultImage from "../../../assets/images/drag_drop.jpg";
import axiosClient from "../../../api/axiosClient";
import cogoToast from "cogo-toast";

function MyEditor() {
  const [image, setImage] = useState(defaultImage);
  const [editor, setEditor] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (dropped) => {
      setImage(dropped[0]);
    },
    noClick: false,
    noKeyboard: true,
  });

  const handleSave = async () => {
    if (!editor) {
      cogoToast.error("Vui lòng chọn hoặc kéo thả ảnh trước khi lưu", {
        position: "bottom-right",
        hideAfter: 3,
        onClick: () => console.log("Clicked"),
      });
      return;
    }

    // Check if the image is different from the default image
    if (image !== defaultImage) {
      const canvas = editor.getImageScaledToCanvas();
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("file", blob, "avatar.jpg");

        try {
          const response = await axiosClient.post(
            "cloud/images/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          const cloudinaryUrl = response.data.data;
          console.log("Cloudinary URL:", cloudinaryUrl);

          const encodedId = localStorage.getItem("userId");
          const userId = atob(encodedId);

          const updateResponse = await axiosClient.patch(`/users/${userId}`, {
            avatar: cloudinaryUrl,
          });

          if (!updateResponse.error) {
            cogoToast.success("Cập nhật ảnh đại diện thành công", {
              position: "bottom-right",
              hideAfter: 3,
              onClick: () => console.log("Clicked"),
            });
          } else {
            console.error(
              "Lỗi khi cập nhật ảnh đại diện:",
              updateResponse.error
            );
          }
        } catch (error) {
          console.error("Lỗi khi tải ảnh lên Cloudinary:", error);
        }
      });
    } else {
      cogoToast.error("Vui lòng chọn hoặc kéo thả ảnh trước khi lưu", {
        position: "bottom-right",
        hideAfter: 3,
        onClick: () => console.log("Clicked"),
      });
    }
  };

  const setEditorRef = (editor) => {
    setEditor(editor);
  };

  return (
    <>
      <p className="d-flex justify-content-center" style={{ fontSize: "20px" }}>
        Kéo thả hoặc chọn ảnh
      </p>
      <div className="d-flex justify-content-center align-items-center">
        <br />
        <div {...getRootProps()} style={{ width: "200px", height: "200px" }}>
          <AvatarEditor
            ref={setEditorRef}
            width={150}
            height={150}
            image={image}
            border={10}
          />
          <input {...getInputProps()} />
        </div>
      </div>
      <div className="d-flex justify-content-center">
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          Save
        </button>
      </div>
    </>
  );
}

export default MyEditor;
